#!/bin/bash

python manage.py collectstatic --noinput
python manage.py makemigrations
python manage.py migrate 
python manage.py getdata
python manage.py runserver 0.0.0.0:80
