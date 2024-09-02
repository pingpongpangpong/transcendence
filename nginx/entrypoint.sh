#!/bin/bash

echo "
upstream django {
	server $DJANGO_HOST:$DJANGO_PORT;
}

map \$http_upgrade \$connection_upgrade {
	default upgrade;
	\'\' close;
}


server {
	listen 80;
	server_name pingpong;
	index index.html;
	root /var/www/html;

	location /user {
		proxy_pass http://django;
	}

	location / {
		try_files \$uri \$uri/ =404;
	}

	location /ws {
                proxy_pass http://django;
				proxy_http_version 1.1;
                proxy_set_header Upgrade \$http_upgrade;
                proxy_set_header Connection \"Upgrade\";
                proxy_set_header Host \$host;
	}
}" > /etc/nginx/sites-available/default

nc -vz $DJANGO_HOST $DJANGO_PORT > /dev/null 2>&1
while [ $? -eq 1 ]
do
        sleep 1
        echo "loading...."
        nc -vz $DJANGO_HOST $DJANGO_PORT > /dev/null 2>&1
done

nginx -g "daemon off;"
