FROM ubuntu:20.04
ARG  DEBIAN_FRONTEND=noninteractive
ENV  TZ=Asia/Seoul

RUN  apt-get update
RUN  apt-get install -y nginx openssl
RUN  apt-get install -y netcat

COPY .private.key /etc/nginx/private.key
COPY .private.crt /etc/nginx/private.crt
COPY nginx/src/ /var/www/html
COPY nginx/entrypoint.sh /root/

CMD ["/bin/bash", "/root/entrypoint.sh"]
