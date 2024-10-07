from django.urls import path
from . import views

urlpatterns = [
    path("list-room/", views.listRoom, name='list-room'),
    path("search-room/", views.searchRoom, name='search-room'),
]