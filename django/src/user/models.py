from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_groups',  # 이름을 변경하여 충돌을 피함
        blank=True,
        help_text=('The groups this user belongs to. A user will get all permissions '
                   'granted to each of their groups.'),
        related_query_name='custom_user_groups_query'
    )
    
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_permissions',  # 이름을 변경하여 충돌을 피함
        blank=True,
        help_text=('Specific permissions for this user.'),
        related_query_name='custom_user_permissions_query',
    )

class AccountToken(models.Model):
	username = models.ForeignKey(User, on_delete=models.CASCADE, related_name='oauth_accounts')
	access_token = models.CharField(max_length=255)
	refresh_token = models.CharField(max_length=255)
	created_at = models.DateTimeField(auto_now_add=True)
	expires_in = models.DateTimeField()

	def __str__(self):
		return f"{self.username} OAuth"