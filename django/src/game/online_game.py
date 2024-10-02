import time
from .ball import Ball
from .player import Player
from django.conf import settings
import logging

class Game:
    def __init__(self, username1, username2, gamepoint):
        self._ball = Ball()
        self._player1 = Player(settings.POSITION["left"], username1)
        self._player2 = Player(settings.POSITION["right"], username2)
        self._gamepoint = gamepoint
        self._balltime = 0
        self._lasttime = time.time()

    def __del__(self):
        del self._ball, self._player1, self._player2

    def playerInput(self, who, input, value):
        if who == settings.PLAYER1:
            self._player1.input(input, value)
        elif who == settings.PLAYER2:
            self._player2.input(input, value)
        

    def update(self):
        currenttime = time.time()
        deltatime = min((currenttime - self._lasttime), 0.1)
        self._lasttime = currenttime
        self._player1.move(deltatime)
        self._player2.move(deltatime)
        self._balltime += deltatime
        if self._balltime >= settings.BALL_START_SLEEP:
            if self._ball.move(self._player1, self._player2, deltatime):
                self._balltime = 0
        if self._player1.score >= self._gamepoint or self._player2.score >= self._gamepoint:
            winner = self._player1.name if self._player1.score > self._player2.score else self._player2.name
            return winner
        return None
        

    def getJson(self):
        return {
            "player1": self._player1.getJson(),
            "player2": self._player2.getJson(),
            "ball": self._ball.getJson()
        }