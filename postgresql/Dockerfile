FROM postgres:13
ARG  DEBIAN_FRONTEND=noninteractive
ENV  TZ=Asia/Seoul

RUN  apt-get update
RUN  apt-get install -y sudo

COPY ./entrypoint.sh /root/
COPY ./dummy.sh /root/

CMD ["/bin/bash", "/root/entrypoint.sh"]
