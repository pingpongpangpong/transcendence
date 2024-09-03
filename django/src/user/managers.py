from django.contrib.auth.base_user import BaseUserManager
from django.utils.translation import gettext_lazy as _

class UserManager(BaseUserManager):
    def create_user(self, ident, email, password):
        if not ident:
            raise ValueError(_('The ID must be set'))
        email = self.normalize_email(email)
        user = self.model(ident=ident, email=email)
        user.set_password(password)
        user.save()
        return user