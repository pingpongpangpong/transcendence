from django import forms
from django.core.exceptions import ValidationError
from .validators import CustomPasswordValidator
from django.contrib.auth.models import User

class UserSignupForm(forms.Form):
	user_id = forms.CharField(
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

	def clean_user_id(self):
		input = self.cleaned_data.get('user_id')
		if User.objects.filter(user_id=input).exists():
			raise ValidationError("이 ID는 이미 사용중입니다.")

	def clean_email(self):
		input = self.cleaned_data.get('email')
		if User.objects.filter(user_id=input).exists():
			raise ValidationError("이 Email은 이미 사용중입니다.")

	def clean_password(self):
		password = self.cleaned_data.get('password')

		validator = CustomPasswordValidator()
		validator.validate(password)

		return password
