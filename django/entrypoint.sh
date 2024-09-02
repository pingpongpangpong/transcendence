#!/bin/bash

nc -vz $DB_HOST $DB_PORT > /dev/null 2>&1
while [ $? -eq 1 ]
do
	sleep 1
	echo "loading...."
	nc -vz $DB_HOST $DB_PORT > /dev/null 2>&1
done

cd /root/src
python3 manage.py makemigrations
python3 manage.py makemigrations game
python3 manage.py migrate
daphne --bind $DJANGO_HOST --port $DJANGO_PORT pingpong.asgi:application
