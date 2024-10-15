# ft_transcendence

### Not about Johnny Depp's movie.

<img alt="main" src="https://github.com/leebo155/ft_transcendence/blob/main/img/readme/transcendence.jpg">

## Introduction
* 이번 프로젝트는 지금 까지 배워온 지식을 바탕으로 **Pong** 게임을 즐길 수 있는 웹사이트를 구현하는 것이 목표입니다.
* 게임은 로그인 후 즐길 수 있으며 기본적으로 등록한 메일로 12자리 무작위 코드를 보내 2차 인증을 합니다.
* 게임은 오프라인과 온라인으로 즐길 수 있으며, 온라인으로 플레이 할 경우 대기방에 접속하여 준비가 완료되면 게임이 시작됩니다.
* 구현된 웹 사이트는 외부 라이브러리의 도움없이 [Single Page Application](https://en.wikipedia.org/wiki/Single-page_application)을 경험할 수 있도록 만들었습니다.
* 모든 서비스는 도커 컨테이너로 구현되어 도커 컴포즈를 사용하여 간단하게 빌드 가능합니다.


### Used Technologies

  #### Front-End
  * Vanilla Javascript
  * Bootstrap toolkit
  * ThreeJs
  
  #### Back-End
  * NginX
  * Django
    - daphne
    - channels
    - rest-frame-work
    - simplejwt
  * PostgreSQL   
    User, 2FA, JWT blacklist 등 사용자의 인증과 관리를 위하여 사용합니다.
  * Redis   
    게임 전 대기방, 즉 Room을 관리하는 Room Manager의 역할을 위하여 사용합니다. 또한 Django Channels 라이브러리의 채널 레이어에 사용됩니다.

    
### Flow Diagram

<img alt="flowchart" src="https://github.com/leebo155/ft_transcendence/blob/main/img/readme/transcendence_flow.jpg">


### WebSocket Communication Diagram

<img alt="flowchart" src="https://github.com/leebo155/ft_transcendence/blob/main/img/readme/pingpong_websocket_1.jpg">
<img alt="flowchart" src="https://github.com/leebo155/ft_transcendence/blob/main/img/readme/pingpong_websocket_2.jpg">
<img alt="flowchart" src="https://github.com/leebo155/ft_transcendence/blob/main/img/readme/pingpong_websocket_3.jpg">

### Made by
|<img src="https://github.com/leebo155.png" width=240>|<img src="https://github.com/juhyeonlee134.png" width="240">|<img src="https://github.com/jmsmg.png" width=240>|
|:--:|:--:|:--:|
|[Bohyeong Lee](https://github.com/bohlee)|[juhyeonlee](https://github.com/juhyeonlee134)|[Seonggon, Cho](https://github.com/Jmsmg)|
|Back|Front|Back|

## Usage

### Requirements
도커 컴포즈를 실행하기 전 최상위 경로에 아래의 3개의 파일이 있어야 정상적으로 서비스가 구동됩니다.
* **.env**
  ```shell
  ## postgresql
  DB_ENGINE=django.db.backends.postgresql
  DB_NAME= #생성되 DB 이름
  DB_USER= #PostgreSQL 유저
  DB_PASSWORD= #PostgreSQL 유저 password
  DB_HOST=postgresql
  DB_PORT= #PostgreSQL 포트
  
  ## django
  SERVER_HOST= #외부에서 접근할 도메인 혹은 IP
  DJANGO_HOST=django
  DJANGO_PORT= #Django 포트
  EMAIL_HOST=smtp.gmail.com
  EMAIL_PORT=587
  EMAIL_USER= #Email에 사용될 유저
  EMAIL_PASSWORD= #Email에 사용될 유저 password
  JWT_SECRET= #Django Secret
  OAUTH_TOKEN_URL=https://api.intra.42.fr/oauth/token
  OAUTH_PROFILE_URL=https://api.intra.42.fr/v2/me
  OAUTH_REDIRECT_URL=https://$SERVER_HOST/user/oauth/ #42API에도 동일하게 등록
  OAUTH_UID= #42API에서 발급받은 UID
  OAUTH_SECRET= #42API에서 발급받은 SECRET
  OAUTH_URL= #42API에서 발급받은 URL
  
  ## redis
  REDIS_HOST=redis
  REDIS_PORT=6379
  ```
* **.private.crt**   
  인증서 생성 예시
  ```shell
  openssl req -new -newkey rsa:2048 -nodes -keyout private.key -out private.csr -subj "/C=KR/L=Seoul/O=?/OU=?/CN=?"
  ```
* **.private.key**   
  인증서 키 생성 예시
  ```shell
  openssl x509 -req -days 365 -in ./private.csr -signkey private.key -out private.crt
  ```


### Makefile
| Rules | Description |
| ----- | ----------- |
| all | Create and run Docker containers and images. |
| stop | Stop running Docker containers. |
| start | Start stopped Docker containers. |
| clean | Terminate created Docker containers. |
| fclean | Remove all created Docker containers and images. |
| re | Recreate Docker containers and images after removing them. |


## Screenshots

### Login
<img alt="screenshot" src="https://github.com/leebo155/ft_transcendence/blob/main/img/screenshots/login.png">

### Signup
<img alt="screenshot" src="https://github.com/leebo155/ft_transcendence/blob/main/img/screenshots/signup.png">

### 2 Fector Authentication
<img alt="screenshot" src="https://github.com/leebo155/ft_transcendence/blob/main/img/screenshots/2FA.png">

### Offline
<img alt="screenshot" src="https://github.com/leebo155/ft_transcendence/blob/main/img/screenshots/offline.png">

### Tournament
<img alt="screenshot" src="https://github.com/leebo155/ft_transcendence/blob/main/img/screenshots/tournament.png">
<img alt="screenshot" src="https://github.com/leebo155/ft_transcendence/blob/main/img/screenshots/tournament4player.png">
<img alt="screenshot" src="https://github.com/leebo155/ft_transcendence/blob/main/img/screenshots/tournament4playerchart.png">

### Online
<img alt="screenshot" src="https://github.com/leebo155/ft_transcendence/blob/main/img/screenshots/online.png">

### Room
<img alt="screenshot" src="https://github.com/leebo155/ft_transcendence/blob/main/img/screenshots/room.png">

### Game
<img alt="screenshot" src="https://github.com/leebo155/ft_transcendence/blob/main/img/screenshots/ingame.png">
