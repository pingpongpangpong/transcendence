import random
import math
from django.conf import settings
from .player import Player

class Ball:
    def __init__(self):
        self._radius = settings.BALL_RADIUS
        self._position = {"x": 0, "y": 0}
        self._velocity = {"x": 0, "y": 0}
        self._isMoving = False
        self._direction = random.random() * 2 - 1 > 0
        self.shoot()
        
    def reset(self):
        randomY = random.random() * 6.6 - 3.3
        self._position = {"x": 0, "y": randomY}
        self._velocity = {"x": 0, "y": 0}
        self._isMoving = False
        self.shoot()
    
    def shoot(self):
        angles = [45, 315, 135, 225]
        index = math.floor(random.random() * 2)
        if self._direction:
            index += 2
                     
        radian = angles[index] * math.pi / 180
        speed = settings.SPEED_START
        self._velocity["x"] = math.cos(radian) * speed
        self._velocity["y"] = math.sin(radian) * speed
        self._isMoving = True
        
    def move(self, player1: Player, player2: Player, deltatime):
        if not self._isMoving:
            return False
        
        limit = settings.HEIGHT_LIMIT
        speed = 30
        self._position["x"] += self._velocity["x"] * (speed * deltatime)
        self._position["y"] += self._velocity["y"] * (speed * deltatime)
        
        if abs(self._position["x"]) > 7:
            self._direction = True
            if self._position["x"] < 0:
                self._direction = False
                player2.score += 1
            else:
                player1.score += 1
            self.reset()
            return True
        
        if abs(self._position["y"]) > limit:
            self._velocity["y"] *= -1
            self._position["y"] = math.copysign(1, self._position["y"]) * limit
            
        self.checkCollision(player1)
        self.checkCollision(player2)
        return False

    def checkCollision(self, player: Player):
        box = player.getBound()
        if self._position["x"] - self._radius < box["maxX"] and \
            self._position["x"] + self._radius > box["minX"] and \
            self._position["y"] + self._radius > box["minY"] and \
            self._position["y"] - self._radius < box["maxY"]:
            
            self._velocity["x"] *= -1
            if self._velocity["x"] > 0:
                self._position["x"] = box["maxX"] + self._radius
            else:
                self._position["x"] = box["minX"] - self._radius
            
            hitPoint = (self._position["y"] - player.position["y"]) / (box["maxY"] - box["minY"])
            self._velocity["y"] = hitPoint * 1
            currentSpeed = math.dist((0, 0, 0), (self._velocity["x"], self._velocity["y"], 0))
            length = math.sqrt(math.pow(self._velocity["x"], 2) + math.pow(self._velocity["y"], 2))
            self._velocity["x"] = self._velocity["x"] / length * currentSpeed
            self._velocity["y"] = self._velocity["y"] / length * currentSpeed

    def getJson(self):
        return {
            "position": self._position
        }