import json
from .models import Room
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async


@database_sync_to_async
def getAll():
    return Room.objects.all()

class GamePlayer(AsyncWebsocketConsumer):
    async def connect(self):
        self.status = "READY"
        self.target = True
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = "game_%s" % self.room_name

        await self.channel_layer.group_add(
                self.room_group_name, self.channel_name
        )

        if len(self.channel_layer.groups[self.room_group_name]) >= 3:
            await self.channel_layer.group_discard(
                self.room_group_name, self.channel_name
            )
            return

        await self.accept()

    async def disconnect(self, close_code):
        if self.status != "FINISH":
            self.target = False
            await self.channel_layer.group_send(
                self.room_group_name, {"type": "disconnect_message"}
            )
        await self.channel_layer.group_discard(
            self.room_group_name, self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        msgType = text_data_json["msgType"]
        if (msgType == "START"):
            await self.channel_layer.group_send(
                self.room_group_name, {"type": "start_message",
                                       "player2": text_data_json['player2']}
            )
        elif (msgType == "SYNC"):
            await self.channel_layer.group_send(
                self.room_group_name, {"type": "sync_message",
                                       "player1x": text_data_json["player1"]["x"],
                                        "player1y": text_data_json["player1"]["y"],
                                        "player1s": text_data_json["player1"]["score"],
                                        "player2x": text_data_json["player2"]["x"],
                                        "player2y": text_data_json["player2"]["y"],
                                        "player2s": text_data_json["player2"]["score"],
                                        "ballx": text_data_json["ball"]["x"],
                                        "bally": text_data_json["ball"]["y"],
                                        "scoreChanged": text_data_json["scoreChanged"] }
            )
        elif (msgType == "INPUT"):
            await self.channel_layer.group_send(
                self.room_group_name, {"type": "input_message",
                                       "keyInputUp": text_data_json["keyInputUp"],
                                        "keyInputDown": text_data_json["keyInputDown"] }
            )
        elif (msgType == "FINISH"):
            await self.channel_layer.group_send(
                self.room_group_name, {"type": "finish_message",
                                  "winner": text_data_json["winner"]}
            )

    async def sync_message(self, event):
        await self.send(text_data=json.dumps({"msgType": "SYNC",
                                              "player1": {
                                                  "x": event["player1x"],
                                                  "y": event["player1y"],
                                                  "score": event["player1s"]
                                              },
                                              "player2": {
                                                  "x": event["player2x"],
                                                  "y": event["player2y"],
                                                  "score": event["player2s"]
                                              },
                                              "ball": {
                                                  "x": event["ballx"],
                                                  "y": event["bally"]
                                              },
                                              "scoreChanged": event["scoreChanged"]
                                              }))
        
    async def input_message(self, event):
        await self.send(text_data=json.dumps({"msgType": "INPUT",
                                                "keyInputUp": event["keyInputUp"],
                                                "keyInputDown": event["keyInputDown"] }))
        
    async def finish_message(self, event):
        self.status = "FINISH"
        await self.send(text_data=json.dumps({"msgType": "FINISH",
                                              "winner": event["winner"]}))

    async def start_message(self, event):
        self.status = "RUNNING"
        await self.send(text_data=json.dumps({"msgType": "START",
                                              "player2": event["player2"]}))

    async def disconnect_message(self, event):
        if (self.target):
            await self.send(text_data=json.dumps({"msgType": "DISCONNECT"}))