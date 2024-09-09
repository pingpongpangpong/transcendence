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
python3 manage.py migrate
#daphne --bind $DJANGO_HOST --port $DJANGO_PORT -e ssl:$DJANGO_PORT:privateKey=private.key:certKey=private.crt pingpong.asgi:application
daphne -e ssl:$DJANGO_PORT:privateKey=private.key:certKey=private.crt pingpong.asgi:application
