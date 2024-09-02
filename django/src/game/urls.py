from django.urls import path
from . import views

urlpatterns = [
    path("create_room", views.createRoom, name='create_rootm'),
    path("list_room", views.listRoom, name='list_room'),
    path("join_room", views.joinRoom, name='join_room'),
    path("search_room", views.searchRoom, name='search_room'),
    path("finish_room", views.finishRoom, name='finish_room'),
    path("exit_player", views.exitPlayer, name='exit_player'),
    path("login/42", views.login42, name='login_42'),
]