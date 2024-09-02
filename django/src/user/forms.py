from django import forms
from .validators import CustomPasswordValidator

class UserSignupForm(forms.Form):
	id = forms.CharField(
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

	def clean_password(self):
		password = self.cleaned_data.get('password')

		validator = CustomPasswordValidator()
		validator.validate(password)

		return password
