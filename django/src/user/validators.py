from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password
import re


class CustomPasswordValidator:
	def __call__(self, value): # 1)
		try:
			validate_password(value)
		except ValidationError as e:
			raise ValidationError(str(e))

	def validate(self, password, user=None):
		"""비밀번호 유효성 검사"""

		if not re.search(r"[a-z]", password):
			raise ValidationError("비밀번호는 하나 이상의 소문자가 포함되어야 합니다.")
		if not re.search(r"[A-Z]", password):
			raise ValidationError("비밀번호는 하나 이상의 대문자가 포함되어야 합니다.")
		if not re.search(r"\d", password):
			raise ValidationError("비밀번호는 하나 이상의 숫자가 포함되어야 합니다.")
		if not re.search(r"[\W_]", password):
			raise ValidationError("비밀번호는 하나 이상의 특수문자가 포함되어야 합니다.")