import json, os, uuid, asyncio, time
from .game_manager import GameManager
from .room import save_room, ready_game, join_room, leave_room, start_game
from django.conf import settings
from django.contrib.sessions.models import Session
from django.contrib.auth.models import User
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

@database_sync_to_async
def getUsername(sessionid):
    try:
        session = Session.objects.get(pk=sessionid)
        user_id = session.get_decoded().get("_auth_user_id")
        user = User.objects.get(id=user_id)
        return user.username
    except Session.DoesNotExist:
        raise Exception("unknown session")
    except User.DoesNotExist:
        raise Exception("unknown user")

class GameConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self._role = None
        self._connection = False
        self._in_game = False
        self._gamemanager: GameManager = None
        sessionid = self.scope["cookies"].get("sessionid", None)

        try:
            if sessionid is None:
                raise Exception("fobidden")
            
            self._username = await getUsername(sessionid)
            self._room_name = self.scope["url_route"]["kwargs"]["room_name"]
            self._room_group_name = await str(uuid.uuid4())
            
            await self.channel_layer.group_add(self._room_group_name,
                                               self.channel_name)
            await self.accept()

        except Exception as e:
            await self.sendOne("exception", {"detail": str(e)})
            await self.close()


    async def disconnect(self, close_code):
        await self.leaveRoom()
        await self.channel_layer.group_discard(self._room_group_name,
                                               self.channel_name)
        await super().disconnect(close_code)


    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        type = text_data_json["type"]
        data = text_data_json["data"]
        try:
            if type == "create":
                await self.createRoom(data)
            elif type == "join":
                await self.joinRoom(data)
            elif type == "ready":
                await self.readyGame(data)
            elif type == "input":
                await self.inputGame(data)
            elif type == "leave":
                await self.close()
            else:
                raise ValueError("unknown type")
        except Exception as e:
            await self.sendOne("exception", {"detail": str(e)})

    async def sendOne(self, type, data=None):
        await self.send(text_data=json.dumps({"type": type,
                                              "data": data}))


    async def sendAll(self, msg):
        await self.send(text_data=json.dumps({"type": msg["status"],
                                              "data": msg["data"]}))
        

    async def createRoom(self, data):
        if self._role != None or self._connection:
            raise Exception("already in the room")
        if len(data["roomname"] > 20 or len(data["password"]) or data["goalpoin"] < 20):
            self.close()
        self._room_name = await save_room(data["roomname"],
                     data["password"],
                     data["goalpoint"],
                     self._username)
        
        await self.channel_layer.group_discard(self._room_group_name,
                                               self.channel_name)
        self._room_group_name = self._room_name
        await self.channel_layer.group_add(self._room_group_name,
                                               self.channel_name)
        await self.channel_layer.group_send(self._room_group_name,
                                                {
                                                    "type": "sendJoin",
                                                    "status": "joined",
                                                    "data": {
                                                        "player1": self._username,
                                                        "player2": None
                                                        }
                                                })
        self._connection = True

    
    async def joinRoom(self, data):
        if self._role != None or self._connection:
            raise Exception("already in the room")
        
        self._room_name = data["roomid"]
        player1, player2, status = await join_room(self._room_name,
                                                   data["password"],
                                                   self._username)
        if (status):
            await self.channel_layer.group_discard(self._room_group_name,
                                                   self.channel_name)
            self._room_group_name = self._room_name
            await self.channel_layer.group_add(self._room_group_name,
                                                self.channel_name)
            await self.channel_layer.group_send(self._room_group_name,
                                                {
                                                    "type": "sendJoin",
                                                    "status": "joined",
                                                    "data": {
                                                        "player1": player1,
                                                        "player2": player2
                                                        }
                                                })
            self._connection = True
        else:
            await self.sendOne("cant_join")
            await self.close()


    async def leaveRoom(self):
        if self._connection:
            self._connection = False
            player1, player2 = await leave_room(self._room_name, self._username)
            if self._in_game:
                self._role = None
                self._in_game = False
                await self.channel_layer.group_send(self._room_group_name,
                                            {
                                                "type": "sendOver",
                                                "status": "over",
                                                "data": {"winner": player1}
                                            })
                if self._gamemanager != None:
                    self._game_session.cancel()
                    try:
                        await self._game_session
                    except asyncio.CancelledError:
                        pass
            else:
                await self.channel_layer.group_send(self._room_group_name,
                                                {
                                                    "type": "sendJoin",
                                                    "status": "joined",
                                                    "data": {
                                                        "player1": player1,
                                                        "player2": player2
                                                        }
                                                })


    async def sendJoin(self, msg):
        if self._username == msg["data"]["player1"]:
            self._role = settings.PLAYER1
        elif self._username == msg["data"]["player2"]:
            self._role = settings.PLAYER2
        await self.send(text_data=json.dumps({"type": msg["status"],
                                              "data": msg["data"]}))
        
    async def readyGame(self, data):
        if self._role == None or self._connection == False:
            raise Exception("this user is not in the room")
        if  self._in_game:
            raise Exception("already is started")
        
        player1, player2 = await ready_game(self._room_name, self._role, data["value"])
        await self.channel_layer.group_send(self._room_group_name,
                                            {
                                                "type": "sendAll",
                                                "status": "readied",
                                                "data": {
                                                    "player1": player1,
                                                    "player2": player2
                                                    }
                                            })
        if player1 and player2:
            self._game_session = asyncio.create_task(self.startGame())
        

    async def startGame(self):
        if self._in_game:
            raise Exception("already is started")
        
        room = await start_game(self._room_name)
        await self.channel_layer.group_send(self._room_group_name,
                                            {
                                                "type": "sendStart",
                                                "status": "start",
                                                "data": room
                                            })
        self._gamemanager = await GameManager(room)

        for data in self._gamemanager.getFrame():
            await self.channel_layer.group_send(self._room_group_name,
                                            {
                                                "type": "sendAll",
                                                "status": "running",
                                                "data": data
                                            })
            await asyncio.sleep(settings.FRAME_PER_SEC)

        winner = self._gamemanager.getWinner()
        await self.channel_layer.group_send(self._room_group_name,
                                        {
                                            "type": "sendOver",
                                            "status": "over",
                                            "data": {"winner": winner}
                                        })
        del self._gamemanager
        self._gamemanager = None

    async def sendStart(self, msg):
        self._in_game = True
        await self.send(text_data=json.dumps({"type": msg["status"],
                                              "data": msg["data"]}))


    async def inputGame(self, data):
        if self._in_game == False:
            raise Exception("game is not started")
        
        if self._gamemanager:
            self._gamemanager.playerInput(self._role, data["input"], data["value"])
        else:
            await self.channel_layer.group_send(self._room_group_name,
                                            {
                                                "type": "keyInput",
                                                "who": self._role,
                                                "input": data["input"],
                                                "value": data["value"]
                                            })
            
    async def keyInput(self, data):
        if self._gamemanager:
            self._gamemanager.playerInput(data["who"], data["input"], data["value"])



    async def sendOver(self, msg):
        if self._connection:
            
            self._role = None
            await self.send(text_data=json.dumps({"type": msg["status"],
                                              "data": msg["data"]}))
            await self.close()