from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    pass

class Room(models.Model):
	room_name = models.CharField(max_length=255)
	goal_point = models.IntegerField()
	room_password = models.IntegerField()
	player1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='player1_rooms')
	player2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='player2_rooms')
	status = models.BooleanField(default=True)

	def __str__(self):
		return self.room_name

class OAuthAccount(models.Model):
	username = models.ForeignKey(User, on_delete=models.CASCADE, related_name='oauth_accounts')
	access_token = models.CharField(max_length=255)
	refresh_token = models.CharField(max_length=255)
	created_at = models.DateTimeField(auto_now_add=True)
	expires_in = models.DateTimeField()

	def __str__(self):
		return f"{self.username} OAuth"