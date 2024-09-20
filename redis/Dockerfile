FROM redis:latest
ARG  DEBIAN_FRONTEND=noninteractive
ENV  TZ=Asia/Seoul

RUN  apt-get update
RUN  apt-get install -y redis-server

COPY ./entrypoint.sh /root/
CMD ["/bin/bash", "/root/entrypoint.sh"]
