#!/bin/bash
# calCount deployment script

source env/bin/activate
pip install -r requirements.txt

cd calcount

python manage.py makemigrations
python manage.py migrate
./manage.py loaddata user.json

echo 'yes' | python manage.py collectstatic

python manage.py test api

python manage.py runserver
