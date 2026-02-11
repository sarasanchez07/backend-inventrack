from django.urls import path

from authentication.views.login_view import LoginView
from authentication.views.register_view import RegisterView
from authentication.views.password_reset_view import PasswordResetView

urlpatterns = [
    path("login/", LoginView.as_view(), name="login"),
    path("register/", RegisterView.as_view(), name="register"),
    path("password-reset/", PasswordResetView.as_view(), name="password-reset"),
]
