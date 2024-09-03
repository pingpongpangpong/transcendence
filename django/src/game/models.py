from django.db import models

class Room(models.Model):
	room_name = models.TextField()
	goal_point = models.IntegerField(default=10)
	password = models.TextField()
	player1 = models.TextField()
	player2 = models.TextField()
	status = models.TextField()