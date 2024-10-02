import * as THREE from 'three';
import { websocket } from "../network.js";

export class Player {
	constructor(position, color, name, up, down) {
		const geometry = new THREE.BoxGeometry(0.1, 0.8, 0.1);
		const material = new THREE.MeshBasicMaterial({ color: color });
		this.mesh = new THREE.Mesh(geometry, material);
		this.mesh.position.set(position, 0, 0);

		this.name = name;
		this.keyMap = { up: up, down: down };
		this.keyInput = { up: false, down: false };
		this.score = 0;

		this.velocity = 0;
		this.maxVelocity = 15;
		this.acceleration = 10;
		this.deceleration = 10;
		this.currentAcceleration = 0;
		this.maxAcceleration = this.acceleration;
		this.accelerationRate = 2;
	}

	keyDown = (event) => {
		if (event.key === this.keyMap.up) {
			this.keyInput.up = true;
		} else if (event.key === this.keyMap.down) {
			this.keyInput.down = true;
		}
	}
	keyUp = (event) => {
		if (event.key === this.keyMap.up) {
			this.keyInput.up = false;
		} else if (event.key === this.keyMap.down) {
			this.keyInput.down = false;
		}
	}
	input() {
		window.addEventListener("keydown", this.keyDown);
		window.addEventListener("keyup", this.keyUp);
	}
	move(deltatime) {
		const limit = 3.3;
		if (this.keyInput.up && this.mesh.position.y < limit) {
			this.currentAcceleration = Math.min(this.currentAcceleration + this.accelerationRate * deltatime, this.maxAcceleration);
			this.velocity = Math.min(this.velocity + this.acceleration, this.maxVelocity);
		} else if (this.keyInput.down && this.mesh.position.y > -limit) {
			this.currentAcceleration = Math.min(this.currentAcceleration + this.accelerationRate * deltatime, this.maxAcceleration);
			this.velocity = Math.max(this.velocity - this.acceleration, -this.maxVelocity);
		} else if (Math.abs(this.velocity) > 0) {
			this.currentAcceleration = 0;
			this.velocity *= 0.9;
			if (Math.abs(this.velocity) < 0.001) {
				this.velocity = 0;
			}
		}
		this.mesh.position.y += this.velocity * deltatime;
		if (this.mesh.position.y > limit) {
			this.mesh.position.y = limit;
			this.velocity = 0;
		} else if (this.mesh.position.y < -limit) {
			this.mesh.position.y = -limit;
			this.velocity = 0;
		}
	}
	getBound() {
		const halfWidth = 0.05;
		const halfHeight = 0.4;
		return {
			minX: this.mesh.position.x - halfWidth,
			maxX: this.mesh.position.x + halfWidth,
			minY: this.mesh.position.y - halfHeight,
			maxY: this.mesh.position.y + halfHeight
		};
	}
	removeEvent() {
		window.removeEventListener("keydown", this.keyDown);
		window.removeEventListener("keyup", this.keyUp);
	}
}