import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";

import * as DOM from  "../document.js";
import { lang, langIndex } from "../lang.js";

let animatedId;

export class Online {
	constructor(gamePoint) {
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

	awake() {
		const boxGeometry = new THREE.BoxGeometry(0.1, 0.8, 0.1);
		const ballGeometry = new THREE.SphereGeometry(0.1, 32, 16);
		const leftPlayerMaterial = new THREE.MeshBasicMaterial({ color: 0xFF2135 });
		const rightPlayerMaterial = new THREE.MeshBasicMaterial({ color: 0x1AAACF });
		const ballMaterial = new THREE.MeshBasicMaterial({ color: 0xFFE400 });

		this.leftPlayer = new THREE.Mesh(boxGeometry, leftPlayerMaterial);
		this.rightPlayer = new THREE.Mesh(boxGeometry, rightPlayerMaterial);
		this.ball = new THREE.Mesh(ballGeometry, ballMaterial);

		this.scene.add(this.leftPlayer);
		this.scene.add(this.rightPlayer);
		this.scene.add(this.ball);
	}

	update() {
		const animate = () => {
			animatedId = requestAnimationFrame(animate);
			this.renderer.render(this.scene, this.camera);
			this.composer.render();
		};
		animate();
	}
}

export function onlineGameExit() {
	cancelAnimationFrame(animatedId);
	
	const gameContainer = document.getElementById("game");
	if (gameContainer) {
		gameContainer.remove();
	}

	DOM.player1Score.innerHTML = "";
	DOM.player2Score.innerHTML = "";
	DOM.gamePoint.innerHTML = `${lang[langIndex].gamePoint}`;
}