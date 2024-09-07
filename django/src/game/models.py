from user.models import User
from django.db import models

class Room(models.Model):
	room_name = models.CharField(max_length=255)
	goal_point = models.IntegerField(default=10)
	room_password = models.CharField()
	player1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='player1_rooms')
	player2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='player2_rooms')
	status = models.BooleanField(default=True)

	def __str__(self):
		return self.room_name