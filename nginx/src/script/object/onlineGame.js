import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";

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

	update(data) {
		const animate = () => {
			requestAnimationFrame(animate);
			this.leftPlayer.position.x = data.player1.position.x;
			this.leftPlayer.position.y = data.player1.position.y;
			this.rightPlayer.position.x = data.player2.position.x;
			this.rightPlayer.position.y = data.player2.position.y;
			this.ball.position.x = data.ball.position.x;
			this.ball.position.y = data.ball.position.y;
			this.renderer.render(this.scene, this.camera);
			this.composer.render();
		};
		animate();
	}
}