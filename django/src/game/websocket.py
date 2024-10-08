import json, asyncio, uuid
from .game_manager import GameManager
from user.models import OauthToken
from .room_manager import save_room, ready_game, join_room, leave_room, start_game, delete_room
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
        if (user.first_name == "oauth"):
            oauth = OauthToken.objects.get(user=user)
            return f"[42] {oauth.username}", user_id
        return f"{user.username}", user_id
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
        self._game_session = None
        sessionid = self.scope["cookies"].get("sessionid", None)

        try:
            if sessionid is None:
                raise Exception("fobidden")
            
            self._username, self._user_id = await getUsername(sessionid)
            await self.channel_layer.group_add(f'usergroup_{self._user_id}',
                                               self.channel_name)
            await self.accept()
            self._uuid = str(uuid.uuid4())
            await self.channel_layer.group_send(f'usergroup_{self._user_id}',
                                                {
                                                    "type": "onlyBeOne",
                                                    "uuid": self._uuid
                                                })

        except Exception as e:
            await self.sendOne("exception", {"detail": str(e)})
            await self.close()


    async def onlyBeOne(self, msg):
        if self._uuid != msg["uuid"]:
            await self.close()


    async def disconnect(self, close_code):
        try:
            await self.leaveRoom()
        except Exception as e:
            await self.sendOne("exception", {"detail": str(e)})

        await self.channel_layer.group_discard(f'usergroup_{self._user_id}',
                                               self.channel_name)
        await self.channel_layer.group_discard(self._room_group_name,
                                               self.channel_name)
        await super().disconnect(close_code)


    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            type = text_data_json.get("type", None)
            if type is None:
                raise Exception("Wrong type")
            data = text_data_json.get("data", None)

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
        if data is None:
            raise Exception("create data is Null")
        
        if self._role != None or self._connection:
            raise Exception("already in the room")
        
        roomname = data.get("roomname")
        password = data.get("password")
        goalpoint = int(data.get("goalpoint"))

        if len(roomname) > 20 or (len(password) != 4 and len(password) != 0) or goalpoint > 20:
            raise Exception("cannot make a room, roomname <= 20, password == 4 or password == 0, goal <= 20")

        self._room_name = save_room(roomname, password, goalpoint, self._username, self._user_id)
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
                                                        },
                                                    "id": {
                                                        "player1": self._user_id,
                                                        "player2": None
                                                    }
                                                })
        self._connection = True
        

    
    async def joinRoom(self, data):
        if data is None:
            raise Exception("join data is Null")
        
        if self._role != None or self._connection:
            raise Exception("already in the room")
        
        self._room_name = data.get("roomid")
        password = data.get("password")
        player1, player1_id, player2, player2_id, status = join_room(self._room_name,
                                                   password,
                                                   self._username,
                                                   self._user_id)
        if (status):
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
                                                        },
                                                    "id": {
                                                        "player1": player1_id,
                                                        "player2": player2_id
                                                    }
                                                })
            self._connection = True
        else:
            await self.sendOne("exception", "cannot join the room")
            await self.close()


    async def leaveRoom(self):
        if self._connection:
            self._connection = False
            player1, player1_id, player2, player2_id = leave_room(self._room_name, self._role)
            if self._in_game:
                delete_room(self._room_name)
                await self.channel_layer.group_send(self._room_group_name,
                                            {"type": "gameOver"})
                await self.channel_layer.group_send(self._room_group_name,
                                            {
                                                "type": "sendOver",
                                                "status": "over",
                                                "data": {"winner": player1}
                                            })
            else:
                await self.channel_layer.group_send(self._room_group_name,
                                                {
                                                    "type": "sendJoin",
                                                    "status": "joined",
                                                    "data": {
                                                        "player1": player1,
                                                        "player2": player2
                                                        },
                                                    "id": {
                                                        "player1": player1_id,
                                                        "player2": player2_id
                                                        }
                                                })


    async def sendJoin(self, msg):
        if self._user_id == msg["id"]["player1"]:
            self._role = settings.PLAYER1
        elif self._user_id == msg["id"]["player2"]:
            self._role = settings.PLAYER2

        msg["data"]["ready1"] = False
        msg["data"]["ready2"] = False
        await self.send(text_data=json.dumps({"type": msg["status"],
                                              "data": msg["data"]}))
        
    async def readyGame(self, data):
        if data is None:
            raise Exception("ready data is Null")
        
        if self._role == None or self._connection == False:
            raise Exception("this user is not in the room")
        if  self._in_game:
            raise Exception("already is started")
        
        player1, player2 = ready_game(self._room_name, self._role, data["value"])
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

        room, player1_id, player2_id = start_game(self._room_name)
        await self.channel_layer.group_send(self._room_group_name,
                                            {
                                                "type": "sendStart",
                                                "status": "start",
                                                "data": room
                                            })
        self._gamemanager = GameManager(room)

        while self._gamemanager.getWinner() is None:
            data = self._gamemanager.getFrame()
            await self.channel_layer.group_send(self._room_group_name,
                                            {
                                                "type": "sendAll",
                                                "status": "running",
                                                "data": data
                                            })
            await asyncio.sleep(settings.FRAME_PER_SEC)

        winner = self._gamemanager.getWinner()
        del self._gamemanager
        self._gamemanager = None
        delete_room(self._room_name)
        await self.channel_layer.group_send(self._room_group_name,
                                        {
                                            "type": "sendOver",
                                            "status": "over",
                                            "data": {"winner": winner}
                                        })
        

    async def sendStart(self, msg):
        self._in_game = True
        await self.send(text_data=json.dumps({"type": msg["status"],
                                              "data": msg["data"]}))


    async def inputGame(self, data):
        if data is None:
            raise Exception("input data is Null")
        
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


    async def gameOver(self, msg):
        if self._game_session:
            self._game_session.cancel()
            try:
                await self._game_session
            except asyncio.CancelledError:
                self._game_session = None
                del self._gamemanager
                self._gamemanager = None


    async def sendOver(self, msg):
        if self._connection:
            self._connection = False
            await self.send(text_data=json.dumps({"type": msg["status"],
                                              "data": msg["data"]}))
            await self.close()


    async def logout(self, msg):
        await self.close()