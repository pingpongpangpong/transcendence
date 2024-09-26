from online_game import Game
from django.conf import settings

class GameManager:
    def __init__(self, room):
        self._game = Game(room["player1"], room["player2"], room["goalpoint"])

    def __del__(self):
        del self._game

    def playerInput(self, who, input, value):
        self._game.playerInput(who, input, value)

    def getFrame(self):
        winner = None
        while winner is None:
            winner = self._game.update()
            yield "running", self._game.getJson()
        yield "over", {"winner": winner}