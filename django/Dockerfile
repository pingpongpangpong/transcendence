FROM python:3.11.4
ARG  DEBIAN_FRONTEND=noninteractive
ENV  TZ=Asia/Seoul
ENV  DJANGO_SETTINGS_MODULE=pingpong.settings

RUN  apt-get update
RUN  apt-get install -y libpq-dev
RUN  apt-get install -y netcat-openbsd
RUN  pip3 install django daphne channels psycopg2-binary requests

COPY ./src /root/src
COPY ./entrypoint.sh /root/entrypoint.sh

CMD ["/bin/bash", "/root/entrypoint.sh"]
