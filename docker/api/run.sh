#!/bin/bash
python manage.py migrate
python manage.py shell < /usr/src/runtime/create-default-channels.py
python manage.py runserver 0.0.0.0:8000
