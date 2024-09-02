from django.db import models

class Room(models.Model):
	room_name = models.TextField()
	goal_point = models.IntegerField(default=10)
	password = models.TextField()
	player1 = models.TextField()
	player2 = models.TextField()
	status = models.TextField()

class User(models.Model):
	user_name = models.TextField() # 사용자 이름
	user_password = models.TextField() # 비밀번호
	user_email = models.TextField() 

class OAuthAccount(models.Model):
	user = models.ForeignKey(User, on_delete=models.CASCADE)
	uid = models.TextField() # 사용자의 고유 ID
	access_token = models.CharField(max_length=255) # 토큰
	refresh_token = models.CharField(max_length=255, blank=True, null=True)
	expires_in = models.DateTimeField()  # 토큰의 만료 시간
	created_at = models.DateTimeField(auto_now_add=True) # 생성 시간