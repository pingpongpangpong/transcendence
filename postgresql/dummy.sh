#!/bin/bash
for var in {1..100}
do
	psql -U gamemaster -d pingpongdb -c "insert into game_room(room_name, goal_point, password, player1, player2, status) values ($var, 3, '', 'player1', 'player2', 'ready');"
done
