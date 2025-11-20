#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


def main():
    """Run administrative tasks."""
    # Determine settings module based on environment
    # This was intended to allow deployment settings when on Azure env but
    # unfortunately Azure is expensive hehe :P 
    # But do not hurt to have this check here, also it could be useful
    # in the future.
    settings_module = 'crud.deployment' if os.environ.get('WEBSITE_HOSTNAME') else 'crud.settings'
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', settings_module)
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
