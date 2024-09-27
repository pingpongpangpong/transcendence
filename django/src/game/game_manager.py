from .online_game import Game
from django.conf import settings

class GameManager:
    def __init__(self, room):
        self._game = Game(room["player1"], room["player2"], room["goalpoint"])
        self._winner = None

    def __del__(self):
        del self._game

    def playerInput(self, who, input, value):
        self._game.playerInput(who, input, value)

    def getFrame(self):
        while self._winner is None:
            self._winner = self._game.update()
            yield self._game.getJson()

    def getWinner(self):
        return self._winner