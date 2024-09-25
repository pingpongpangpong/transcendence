import json, os, uuid, asyncio, time
from game_manager import GameManager
from room import save_room, get_room, join_room, leave_room
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
            await self.sendOne("established")

        except Exception as e:
            await self.sendOne("exception", {"detail": str(e)})
            await self.close()


    async def disconnect(self, close_code):
        await self.leaveRoom()
        self._connection = False
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
                await self.leaveRoom()
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
        if self._role != None and self._connection:
            raise Exception("already in the room")
        self._room_name = await save_room(data["roomname"],
                     data["password"],
                     data["goalpoint"],
                     self._username)
        
        await self.channel_layer.group_discard(self._room_group_name,
                                               self.channel_name)
        self._room_group_name = self._room_name
        await self.channel_layer.group_add(self._room_group_name,
                                               self.channel_name)
        await self.sendOne("created", {"player1": self._username})
        self._role = settings.PLAYER1
        self._connection = True
    

    async def joinRoom(self, data):
        if self._role != None and self._connection:
            raise Exception("already in the room")
        
        if (await join_room(self._room_name, data["password"], self._username)):
            await self.channel_layer.group_discard(self._room_group_name,
                                                   self.channel_name)
            self._room_group_name = self._room_name
            await self.channel_layer.group_add(self._room_group_name,
                                                self.channel_name)
            room = await get_room(self._room_name)
            await self.channel_layer.group_send(self._room_group_name,
                                                {
                                                    "type": "sendAll",
                                                    "status": "joined",
                                                    "data": {
                                                        "player1": room["player1"],
                                                        "player2": room["player2"]
                                                        }
                                                })
            self._role = settings.PLAYER2
            self._connection = True
        else:
            await self.sendOne("cant_join")
            await self.close()
        
    async def readyGame(self, data):
        if self._role == None and self._connection == False:
            raise Exception("this user is not in the room")
        
        player1, player2, status = await ready_room(self._role, data["value"])
        if player1 and player2 and not status:
            self._game_session = asyncio.create_task(self.startGame())
        await self.channel_layer.group_send(self._room_group_name,
                                            {
                                                "type": "sendAll",
                                                "status": "readied",
                                                "data": {
                                                    "player1": player1,
                                                    "player2": player2
                                                    }
                                            })
        

    async def startGame(self):
        if self._gamemanager:
            raise Exception("already is started")
        
        room = await get_room(self._room_name)
        await self.channel_layer.group_send(self._room_group_name,
                                            {
                                                "type": "sendAll",
                                                "status": "start",
                                                "data": room
                                            })
        self._gamemanager = await GameManager(room)

        for status, data in self._gamemanager.getFrame():
            await self.channel_layer.group_send(self._room_group_name,
                                            {
                                                "type": "sendAll",
                                                "status": status,
                                                "data": data
                                            })
            await time.sleep(settings.FRAME_PER_SEC)

        del self._gamemanager
        self._gamemanager = None


    async def inputGame(self, data):
        if self._gamemanager == None or self._connection == False:
            raise Exception("game is not started")
        
        self._gamemanager.playerInput(self._role, data["input"], data["value"])

    async def leaveRoom(self):
        if self._connection:
            await leave_room(self._room_name, self._username)
            room = await get_room(self._room_name)
            if room["in_game"]:
                if self._role == settings.PLAYER1:
                    winner = room["player2"]
                elif self._role == settings.PLAYER2:
                    winner = room["player1"]
                await self.channel_layer.group_send(self._room_group_name,
                                            {
                                                "type": "sendAll",
                                                "status": "winner",
                                                "data": {"winner": winner}
                                            })
                self._game_session.cancel()
                try:
                    await self._game_session
                except asyncio.CancelledError:
                    pass
            else:
                await self.channel_layer.group_send(self._room_group_name,
                                                {
                                                    "type": "sendAll",
                                                    "status": "joined",
                                                    "data": {
                                                        "player1": room["player1"],
                                                        "player2": room["player2"]
                                                        }
                                                })