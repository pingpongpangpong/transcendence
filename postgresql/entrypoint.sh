#!/bin/bash

pg_createcluster 13 main

sed -i "s/port = $DB_PORT/port = $DUMMY_PORT/g" /etc/postgresql/13/main/postgresql.conf

service postgresql start

QUERY="sudo -u postgres psql -c"
$QUERY "create user $DB_USER with password '$DB_PASSWORD';"
$QUERY "create database $DB_NAME owner $DB_USER;"
$QUERY "alter role $DB_USER set client_encoding to 'utf8';"
$QUERY "alter role $DB_USER set default_transaction_isolation to 'read committed';"
$QUERY "alter role $DB_USER set timezone to 'UTC';"
$QUERY "grant all privileges on database $DB_NAME to $DB_USER;"

service postgresql stop

echo "host    $DB_NAME      $DB_USER      0.0.0.0/0          trust" >> /etc/postgresql/13/main/pg_hba.conf
sed -i 's/local   all             all                                     peer/local   all             all                                     trust/g' /etc/postgresql/13/main/pg_hba.conf
echo "listen_addresses = 'postgresql'" >> /etc/postgresql/13/main/postgresql.conf

sed -i "s/port = $DUMMY_PORT/port = $DB_PORT/g" /etc/postgresql/13/main/postgresql.conf

sudo -u postgres /usr/lib/postgresql/13/bin/postgres -D /var/lib/postgresql/13/main -c config_file=/etc/postgresql/13/main/postgresql.conf
