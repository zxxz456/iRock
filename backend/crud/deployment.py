import os

DEBUG = False

# prod domain names
ALLOWED_HOSTS = ['*']

# statics (collectstatic)
STATIC_ROOT = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'staticfiles')
STATIC_URL = '/static/'

# media files
MEDIA_ROOT = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'media')
MEDIA_URL = '/media/'

# Security settings
# True if HTTPS ---------------------------------------------
SECURE_SSL_REDIRECT = False  
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False
# -----------------------------------------------------------
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# CORS
CORS_ALLOWED_ORIGINS = [
]

# WhiteNoise 4 static file
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # ALWAYS after
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
