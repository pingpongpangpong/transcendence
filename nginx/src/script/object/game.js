import * as THREE from 'three';
import { Player } from './player.js';
import { Ball } from './ball.js';
import { lang, langIndex } from '../lang.js';

const player1Score = document.getElementById('l-player');
const player2Score = document.getElementById('r-player');
const painGamePoint = document.getElementById('show-gp');
let animatedId;
export let winner;

export class Game {
	constructor(gamePoint) {
		this.scene = new THREE.Scene();
		
		this.camera = new THREE.PerspectiveCamera(75, 950 / 600, 0.1, 1000);
		this.camera.position.set(0, 0, 5);

		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.renderer.setSize(950, 600);
		this.renderer.domElement.id = 'game';
		document.querySelector('.content').appendChild(this.renderer.domElement);

		const light = new THREE.PointLight(0xFFFFFF, 90);
		light.position.set(0, 0, 5);
		this.scene.add(light);
	
		this.gamePoint = gamePoint;
	}

	awake(name1, name2) {
		this.player1 = new Player(-4.8, 0xFF2135, name1, 'w', 's');
		this.player2 = new Player(4.8, 0x1AAACF, name2, 'ArrowUp', 'ArrowDown');
		this.ball = new Ball();

		this.scene.add(this.player1.mesh);
		this.scene.add(this.player2.mesh);
		this.scene.add(this.ball.mesh);

		this.player1.input();
		this.player2.input();
	}

	update() {
		return new Promise((resolve) => {
			this.updateScore();
			let lasttime = performance.now();
			const animate = (currenttime) => {
				const deltatime = Math.min((currenttime - lasttime) / 1000, 0.1);
				lasttime = currenttime;
				this.player1.move(deltatime);
				this.player2.move(deltatime);
				if (this.ball.move(this.player1, this.player2, deltatime)) {
					this.updateScore();
				}
				if (this.player1.score >= this.gamePoint || this.player2.score >= this.gamePoint) {
					winner = this.player1.score > this.player2.score ? this.player1.name: this.player2.name;
					this.end(winner);
					exit();
					resolve();
				} else {
					animatedId = requestAnimationFrame(animate);
					this.renderer.render(this.scene, this.camera);
				}
			}
			animate(0);
		});
	}

	updateScore() {
		player1Score.innerHTML = `${this.player1.name}: ${this.player1.score}`;
		player2Score.innerHTML = `${this.player2.name}: ${this.player2.score}`;
	}

	end(winner) {
		while(this.scene.children.length > 0) { 
			this.scene.remove(this.scene.children[0]); 
		}
		if (this.renderer) {
			this.renderer.dispose();
			this.renderer.forceContextLoss();
			this.renderer.context = null;
			this.renderer.domElement = null;
		}
		this.scene = null;
		this.camera = null;
		this.renderer = null;
		this.player1 = null;
		this.player2 = null;
		this.ball = null;
		alert(`${winner}${lang[langIndex].win}`);
	}
}

export function exit() {
	cancelAnimationFrame(animatedId);

	const gameContainer = document.querySelector('#game');
	if (gameContainer) {
		gameContainer.remove();
	}

	player1Score.innerHTML = '';
	player2Score.innerHTML = '';
	painGamePoint.innerHTML = `${lang[langIndex].gamePoint}: `;
}