"""
WSGI config for crud project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

settings_module = 'crud.deployment' if os.environ.get('WEBSITE_HOSTNAME') else 'crud.settings'
os.environ.setdefault('DJANGO_SETTINGS_MODULE', settings_module)

# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crud.settings')

application = get_wsgi_application()
