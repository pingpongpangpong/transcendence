from django.conf import settings

class Player:
    def __init__(self, position, name):
        self.name = name
        self._paddle = settings.PADDLE,
        self.position = { "x": position, "y": 0 }
        self._keyInput = { "up": False, "down": False }
        self.score = 0
        self._velocity = 0
        self._maxVelocity = 15
        self._acceleration = 10
        self._deceleration = 10
        self._currentAcceleration = 0
        self._maxAcceleration = self._acceleration
        self._accelerationRate = 2

    def input(self, input, value):
        self._keyInput[input] = value

    def move(self, deltatime):
        limit = settings.HEIGHT_LIMIT
        if self._keyInput["up"] and self.position["y"] < limit:
            self._currentAcceleration = min(self._currentAcceleration + self._accelerationRate * deltatime, self._maxAcceleration)
            self._velocity = min(self._velocity + self._acceleration, self._maxVelocity)
        elif self._keyInput["down"] and self.position["y"] > -limit:
            self._currentAcceleration = min(self._currentAcceleration + self._accelerationRate * deltatime, self._maxAcceleration)
            self._velocity = max(self._velocity - self._acceleration, -self._maxVelocity)
        elif abs(self._velocity) > 0:
            self._currentAcceleration = 0
            self._velocity *= 0.9
            if abs(self._velocity) < 0.001:
                self._velocity = 0
        
        self.position["y"] += self._velocity * deltatime
        if self.position["y"] > limit:
            self.position["y"] = limit
            self._velocity = 0
        elif self.position["y"] < -limit:
            self.position["y"] = -limit
            self._velocity = 0

    def getBound(self):
        halfWidth = 0.05
        halfHeight = 0.4
        return {
            "minX": self.position["x"] - halfWidth,
            "maxX": self.position["x"] + halfWidth,
            "minY": self.position["y"] - halfHeight,
            "maxY": self.position["y"] + halfHeight
        }
    
    def getJson(self):
        return {
            "position": self.position,
            "score": self.score
        }