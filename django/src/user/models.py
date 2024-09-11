from django.contrib.auth.models import User
from django.contrib.sessions.models import Session
from django.db import models

class LoginSession(models.Model):
	user = models.ForeignKey(User, on_delete=models.CASCADE)
	session = models.ForeignKey(Session, on_delete=models.CASCADE)

class AccountToken(models.Model):
	username = models.ForeignKey(User, on_delete=models.CASCADE, related_name='oauth_accounts')
	access_token = models.CharField(max_length=255)
	refresh_token = models.CharField(max_length=255)
	created_at = models.DateTimeField(auto_now_add=True)
	expires_in = models.DateTimeField()

	def __str__(self):
		return f"{self.username} OAuth"