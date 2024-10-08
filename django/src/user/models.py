from django.contrib.auth.models import User
from django.contrib.sessions.models import Session
from django.db import models
from django.utils import timezone
from datetime import timedelta

class LoginSession(models.Model):
	user = models.ForeignKey(User, on_delete=models.CASCADE)
	session = models.ForeignKey(Session, on_delete=models.CASCADE)

class OauthToken(models.Model):
	username = models.CharField(max_length=20)
	access_token = models.CharField(max_length=100)
	user = models.ForeignKey(User, on_delete=models.CASCADE)

class EmailVerification(models.Model):
	email = models.EmailField()
	code = models.CharField(max_length=12)
	is_expired = models.BooleanField(default=False)
	is_verified = models.BooleanField(default=False)
	created_at = models.DateTimeField(auto_now_add=True)

	@property
	def is_expired(self):
		expiration_time = self.created_at + timedelta(minutes=1)
		return timezone.now() >= expiration_time

	@classmethod
	def delete_expired(cls):
		expiration_time = timezone.now() - timedelta(minutes=3)
		expired_records = cls.objects.filter(created_at__lt=expiration_time)

		count, _ = expired_records.delete()
		return count 

	def __str__(self):
		return f"{self.user.email}"