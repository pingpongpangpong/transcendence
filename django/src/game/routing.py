from django.urls import re_path
from . import players

websocket_urlpatterns = [
    re_path(r"ws/(?P<room_name>\w+)/$",
            players.GamePlayer.as_asgi()),
]