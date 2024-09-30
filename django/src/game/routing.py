from django.urls import re_path
from .websocket import GameConsumer

websocket_urlpatterns = [
    re_path("ws/room/", GameConsumer.as_asgi()),
]