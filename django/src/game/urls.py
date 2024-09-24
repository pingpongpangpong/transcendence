from django.urls import path
from . import views

urlpatterns = [
    path("create-room/", views.createRoom, name='create-room'),
    path("list-room/", views.listRoom, name='list-room'),
    path("join-room", views.joinRoom, name='join-room'),
    # path("search-room", views.searchRoom, name='search-room'),
    # path("finish-room", views.finishRoom, name='finish-room'),
    # path("exit-player", views.exitPlayer, name='exit-player'),
]