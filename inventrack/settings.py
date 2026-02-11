"""
Django settings for InvenTrack project.

Sistema de Gestión de Inventarios
Backend con Django + Django REST Framework
"""

from pathlib import Path
import os
from dotenv import load_dotenv
from datetime import timedelta
from corsheaders.defaults import default_headers
import sys

# --------------------------------------------------
# BASE
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

# Cargar variables de entorno
load_dotenv(BASE_DIR / '.env')

# --------------------------------------------------
# SEGURIDAD
# --------------------------------------------------

SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "django-insecure-inventrack-dev-key"
)

DEBUG = os.getenv("DEBUG", "True").lower() == "true"

ALLOWED_HOSTS = [
    host.strip()
    for host in os.getenv("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")
    if host.strip()
]

# --------------------------------------------------
# APLICACIONES
# --------------------------------------------------

INSTALLED_APPS = [
    # Django core
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Terceros
    "rest_framework",
    "rest_framework.authtoken",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "drf_spectacular",
    "corsheaders",
    "django_filters",

    # Apps locales (InvenTrack)
    "apps.authentication",
    #"apps.personnel",
    #"apps.inventory",
    #"apps.categories",
    #"apps.products",
    #"apps.movements",
    #"apps.reports",
    #"apps.alerts",
    #"apps.dashboard",
]

# --------------------------------------------------
# USUARIO PERSONALIZADO
# --------------------------------------------------

AUTH_USER_MODEL = "authentication.User"

# --------------------------------------------------
# MIDDLEWARE
# --------------------------------------------------

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# --------------------------------------------------
# URLS / WSGI
# --------------------------------------------------

ROOT_URLCONF = "inventrack.urls"

WSGI_APPLICATION = "inventrack.wsgi.application"

# --------------------------------------------------
# TEMPLATES (opcional, por si usas admin o emails)
# --------------------------------------------------

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# --------------------------------------------------
# BASE DE DATOS
# --------------------------------------------------

# SQLite para tests, PostgreSQL para desarrollo/producción
if "test" in sys.argv or "pytest" in sys.modules:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": ":memory:",
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": os.getenv("DB_NAME", "inventrack_db"),
            "USER": os.getenv("DB_USER", "postgres"),
            "PASSWORD": os.getenv("DB_PASSWORD", ""),
            "HOST": os.getenv("DB_HOST", "localhost"),
            "PORT": os.getenv("DB_PORT", "5432"),
        }
    }

# --------------------------------------------------
# VALIDADORES DE CONTRASEÑA
# --------------------------------------------------

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# --------------------------------------------------
# INTERNACIONALIZACIÓN
# --------------------------------------------------

LANGUAGE_CODE = "es-co"
TIME_ZONE = "America/Bogota"
USE_I18N = True
USE_TZ = True

# --------------------------------------------------
# ARCHIVOS ESTÁTICOS Y MEDIA
# --------------------------------------------------

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_DIRS = [BASE_DIR / "static"]

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# --------------------------------------------------
# DJANGO REST FRAMEWORK
# --------------------------------------------------

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 50,
}

# --------------------------------------------------
# JWT
# --------------------------------------------------

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "ROTATE_REFRESH_TOKENS": False,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# --------------------------------------------------
# SWAGGER / OPENAPI
# --------------------------------------------------

SPECTACULAR_SETTINGS = {
    "TITLE": "InvenTrack API",
    "DESCRIPTION": "Documentación oficial de la API del sistema de gestión de inventarios InvenTrack",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "SERVE_PERMISSIONS": ["rest_framework.permissions.AllowAny"],
    "SCHEMA_PATH_PREFIX": "/api/v1",
    "TAGS_SORTER": "alpha",
}

# --------------------------------------------------
# CORS (Frontend separado)
# --------------------------------------------------

CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
]

CORS_ALLOW_ALL_ORIGINS = DEBUG
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = list(default_headers) + ["authorization"]

# --------------------------------------------------
# EMAIL (opcional – recuperación de contraseña)
# --------------------------------------------------
#EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
#EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.gmail.com")
#EMAIL_PORT = int(os.getenv("EMAIL_PORT", 587))
#EMAIL_USE_TLS = os.getenv("EMAIL_USE_TLS", "True") == "True"
#EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER")
#EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD")
#DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", EMAIL_HOST_USER)

# --------------------------------------------------
# FRONTEND
# --------------------------------------------------

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
