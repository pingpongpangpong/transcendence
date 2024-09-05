from django import forms
from django.core.exceptions import ValidationError
from .validators import CustomPasswordValidator
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSignupForm(forms.Form):
	username = forms.CharField(
		min_length=5, 
		max_length=20,
		required=True
	)

	password = forms.CharField(
		min_length=8, 
		max_length=20, 
		widget=forms.PasswordInput(),
		required=True
	)

	email = forms.EmailField(required=True)

	def clean_username(self):
		username = self.cleaned_data.get('username')
		if User.objects.filter(username=username).exists():
			raise ValidationError("이 ID는 이미 사용중입니다.")
		return username

	def clean_email(self):
		email = self.cleaned_data.get('email')
		if User.objects.filter(email=email).exists():
			raise ValidationError("이 Email은 이미 사용중입니다.")
		return email

	def clean_password(self):
		password = self.cleaned_data.get('password')

		validator = CustomPasswordValidator()
		validator.validate(password)

		return password
