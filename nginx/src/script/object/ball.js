import * as THREE from 'three';

export class Ball {
	constructor() {
		const geometry = new THREE.SphereGeometry(0.1, 32, 16);
		const material = new THREE.MeshBasicMaterial({ color: 0xFFE400 });
		this.mesh = new THREE.Mesh(geometry, material);
		this.velocity = new THREE.Vector3(0, 0, 0);
		this.isMoving = false;

		const random = Math.random() * 2 - 1;
		const direction = random > 0 ? 1 : -1;
		this.reset(direction);
	}
	reset(direction) {
		const randomY = Math.random() * 6.6 - 3.3;
		this.mesh.position.set(0, randomY, 0);

		this.velocity.set(0, 0, 0);
		this.isMoving = false;
		setTimeout(() => this.shoot(direction), 1000);
	}
	shoot(direction) {
		const angles = [45, 315, 135, 225];
		let index = Math.floor(Math.random() * 2);
		if (direction > 0) {
			index += 2;
		}
		const radian = angles[index] * Math.PI / 180;
		const speed = 0.3;
		this.velocity.set(
			Math.cos(radian) * speed,
			Math.sin(radian) * speed,
			0
		);
		this.isMoving = true;
	}
	move(player1, player2, deltatime) {
		if (!this.isMoving) {
			return false;
		}
		const limit = 3.3;
		const speed = 30;
		this.mesh.position.add(this.velocity.clone().multiplyScalar(speed * deltatime));
		if (Math.abs(this.mesh.position.x) > 7) {
			let direction = 1;
			if (this.mesh.position.x < 0) {
				direction = -1;
				player2.score++;
			} else {
				player1.score++;
			}
			this.reset(direction);
			return true;
		}
		if (Math.abs(this.mesh.position.y) > limit) {
			this.velocity.y *= -1;
			this.mesh.position.y = Math.sign(this.mesh.position.y) * limit;
		}
		this.checkCollision(player1);
		this.checkCollision(player2);
	}
	checkCollision(player) {
		const radius = 0.1;
		const box = player.getBound();
		if (this.mesh.position.x - radius < box.maxX && 
			this.mesh.position.x + radius > box.minX && 
			this.mesh.position.y + radius > box.minY && 
			this.mesh.position.y - radius < box.maxY) {
			this.velocity.x *= -1;
			if (this.velocity.x > 0) {
				this.mesh.position.x = box.maxX + radius;
			} else {
				this.mesh.position.x = box.minX - radius;
			}
			const hitPoint = (this.mesh.position.y - player.mesh.position.y) / (box.maxY - box.minY);
			this.velocity.y = hitPoint * 1;
			const currentSpeed = this.velocity.length();
			this.velocity.normalize().multiplyScalar(currentSpeed);
		}
	}
}