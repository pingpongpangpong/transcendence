
function connectGameServer() {
    websocket = new WebSocket (
        'wss://'
        + window.location.host
        + '/ws/'
        + roomname
        + '/'
    );

    if (!websocket) {
        alert("cannot connect websocket");
        return null
    }

    websocket.onopen = (e) => {
    }

    websocket.onclose = (e) => {
    }

    websocket.onmessage = (e) => {
        const json_data = JSON.parse(e.data);
        const data = json_data.data;

        switch (json_data.type) {
            case "joined":
                // 대기실 화면으로 이동
                document.getElementById('player1-id').innerHTML = "player1: " + data.player1;
                document.getElementById('player2-id').innerHTML = "player2: " + data.player1;
                break;

            case "readied":
                document.getElementById('player1-ready').innerHTML = data.player1 ? "ready": "not";
                document.getElementById('player2-ready').innerHTML = data.player2 ? "ready": "not";
                break;

            case "start":
                // 게임 화면 이동
                const game = new Game(data.gamepoint);
                game.awake(data.player1, data.player2);

                // 조작 키 핸들러
                window.addEventListener("keyup", (e) => {
                    if (game) {
                        if (e.key === "ArrowUp") {
                            let input = "up";
                        } else if (e.key === "ArrowDown") {
                            let input = "down";
                        }
                        if (websocket) {
                            websocket.send(JSON.stringify({
                                'type': 'input',
                                'input': input,
                                'value': false
                            }));
                        }
                    }
                });

                window.addEventListener("keydown", (e) => {
                    if (game) {
                        if (e.key === "ArrowUp") {
                            let input = "up";
                        } else if (e.key === "ArrowDown") {
                            let input = "down";
                        }
                        if (websocket) {
                            websocket.send(JSON.stringify({
                                'type': 'input',
                                'input': input,
                                'value': true
                            }));
                        }
                    }
                });

                // 게임 렌더 시작
                game.update();
                break;

            case "running":
                // 게임 동기화
                game.player1.mesh.position.x = data.player1.position.x;
                game.player1.mesh.position.y = data.player1.position.y;
                game.player1.score = data.player1.score;
                game.player2.mesh.position.x = data.player2.position.x;
                game.player2.mesh.position.y = data.player2.position.y;
                game.player2.score = data.player2.score;
                game.ball.mesh.position.x = data.ball.position.x;
                game.ball.mesh.position.y = data.ball.position.y;
                break;

            case "over":
                game.end(data.winner);
                websocket.close()
                websocket = null
        }
    }
    return websocket
}

// 방 생성 시
websocket = connectGameServer();
websocket.send(JSON.stringify({
    "type": "create",
    "data": { 
        "roomname": roomname,
        "password": password,
        "goalpoint": goalpoint
    }
}));

// 방 참가 시
websocket = connectGameServer();
websocket.send(JSON.stringify({
    "type": "join",
    "data": { 
        "roomid": roomid,
        "password": password
    }
}));

// 방 준비 버튼
// 버튼을 누를때마다 true와 false를 번갈아 가며 보내야 할지 그냥 true만 보낼지 고민
ready_button.addEventListener('click', e => {
    websocket.send(JSON.stringify({
        "type": "ready",
        "data": { 
            "value": bool
        }
    }));
});

// 방 떠나기 버튼
leave_button.addEventListener('click', e => {
    websocket.send(JSON.stringify({
        "type": "leave",
        "data": null
    }));
});