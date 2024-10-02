import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";

import * as DOM from "../document.js";
import { Player } from "./player.js";
import { Ball } from "./ball.js";
import { lang, langIndex } from "../lang.js";

let animatedId;
export let winner;

export class Game {
	constructor(gamePoint, whatGame) {
		sessionStorage.setItem("game", whatGame);
		this.scene = new THREE.Scene();
		
		this.camera = new THREE.PerspectiveCamera(75, 950 / 600, 0.1, 1000);
		this.camera.position.set(0, 0, 5);

		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.renderer.setSize(950, 600);
		this.renderer.domElement.id = "game";
		document.querySelector("#content").appendChild(this.renderer.domElement);

		const light = new THREE.PointLight(0xFFFFFF, 3);
		light.position.set(0, 0, 5);
		this.scene.add(light);
	
		this.gamePoint = gamePoint;

		// 불룸 효과
		this.composer = new EffectComposer(this.renderer);
		const renderScene = new RenderPass(this.scene, this.camera);
		this.composer.addPass(renderScene);

		const bloomPass = new UnrealBloomPass(new THREE.Vector2(950, 600), 1.5, 0.4, 0.85);
		bloomPass.threshold = 0;
		bloomPass.strength = 2;
		bloomPass.radius = 0;
		this.composer.addPass(bloomPass);

		// 카메라 회전
		const orbit = new OrbitControls(this.camera, this.renderer.domElement);
		orbit.maxPolarAngle = Math.PI * 0.5;
		orbit.minDistance = 3;
		orbit.maxDistance = 8;
	}

	awake(name1, name2) {
		this.player1 = new Player(-4.8, 0xFF2135, name1, "w", "s");
		this.player2 = new Player(4.8, 0x1AAACF, name2, "ArrowUp", "ArrowDown");
		this.ball = new Ball();

		this.scene.add(this.player1.mesh);
		this.scene.add(this.player2.mesh);
		this.scene.add(this.ball.mesh);

		this.player1.input();
		this.player2.input();
	}

	onlineAwake(name1, name2) {
		this.player1 = new Player(-4.8, 0xFF2135, name1, "w", "s");
		this.player2 = new Player(4.8, 0x1AAACF, name2, "ArrowUp", "ArrowDown");
		this.ball = new Ball();

		this.scene.add(this.player1.mesh);
		this.scene.add(this.player2.mesh);
		this.scene.add(this.ball.mesh);

		this.player1.online();
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
				this.composer.render();
			}
			animate(0);
		});
	}

	onlineUpdate(data) {
		return new Promise(() => {
			const animate = () => {
				this.player1.mesh.position.x = data.player1.position.x;
				this.player1.mesh.position.y = data.player1.position.y;
				this.player2.mesh.position.x = data.player2.position.x;
				this.player2.mesh.position.y = data.player2.position.y;
				this.player1.score = data.player1.score;
				this.player2.score = data.player2.score;
				this.ball.mesh.position.x = data.ball.position.x;
				this.ball.mesh.position.y = data.ball.position.y;
				animatedId = requestAnimationFrame(animate);
				this.renderer.render(this.scene, this.camera);
				this.composer.render();
			}
			animate(0);
		});
	}

	updateScore() {
		DOM.player1Score.innerHTML = `${this.player1.name}: ${this.player1.score}`;
		DOM.player2Score.innerHTML = `${this.player2.name}: ${this.player2.score}`;
	}

	end(winner) {
		this.player1.removeEvent();
		this.player2.removeEvent();
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
		sessionStorage.removeItem("game");
		alert(`${winner}${lang[langIndex].win}`);
	}
}

export function exit() {
	sessionStorage.removeItem("game");
	cancelAnimationFrame(animatedId);

	const gameContainer = document.querySelector("#game");
	if (gameContainer) {
		gameContainer.remove();
	}

	DOM.player1Score.innerHTML = "";
	DOM.player2Score.innerHTML = "";
	DOM.gamePoint.innerHTML = `${lang[langIndex].gamePoint}: `;
}