FROM ubuntu:20.04
ARG  DEBIAN_FRONTEND=noninteractive
ENV  TZ=Asia/Seoul

RUN  apt-get update
RUN  apt-get install -y nginx
RUN  apt-get install -y netcat

COPY ./src/public /var/www/html
COPY ./entrypoint.sh /root/

CMD ["/bin/bash", "/root/entrypoint.sh"]
