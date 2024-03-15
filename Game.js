import * as THREE from './libs/three137/three.module.js';
import { LoadingBar } from './libs/LoadingBar.js';
import { Plane } from './Plane.js';
import { Obstacles } from './Obstacles.js';
import {OrbitControls} from './libs/three137/OrbitControls.js';

class Game{
	constructor(){
		const container = document.createElement( 'div' );
		document.body.appendChild( container );
        
        this.plane
        this.loadingBar = new LoadingBar();
        this.loadingBar.visible = false;

        this.clock = new THREE.Clock();

		this.assetsPath = '../../assets/';
        
		this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
        this.camera.position.set( -10, 0, -10 );
        this.camera.lookAt(0,0,10);

        this.cameraController = new THREE.Object3D();
        this.cameraController.add(this.camera);
        this.cameraTarget = new THREE.Vector3(0,0,10);
        
		this.scene = new THREE.Scene();
        this.scene.add(this.cameraController);

		const ambient = new THREE.AmbientLight(0xffffff, 1);
		this.scene.add(ambient);
			
		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true } );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.outputEncoding = THREE.sRGBEncoding;
		container.appendChild( this.renderer.domElement );
        
        const controls = new OrbitControls(this.camera,this.renderer.domElement)

        this.active = false;
        this.load();

        window.addEventListener('resize', this.resize.bind(this) );

        document.addEventListener('keydown', this.keyDown.bind(this));
        document.addEventListener('keyup', this.keyUp.bind(this));

        document.addEventListener('mousedown', this.mouseDown.bind(this) );
        document.addEventListener('mouseup', this.mouseUp.bind(this) );
        
        this.spaceKey = false;

        const btn = document.getElementById('playBtn');
        btn.addEventListener('click', this.startGame.bind(this));
	}
	
    startGame(){
        const gameover = document.getElementById('gameover');
        const instructions = document.getElementById('instructions');
        const btn = document.getElementById('playBtn');

        gameover.style.display = 'none';
        instructions.style.display = 'none';
        btn.style.display = 'none';

        this.score = 0;
        this.lives = 1;

        let elm = document.getElementById('score');
        elm.innerHTML = this.score;
        

        this.plane.reset();
        this.obstacles.reset();

        this.active = true;
    }

    resize(){
        this.camera.aspect = window.innerWidth / window.innerHeight;
    	this.camera.updateProjectionMatrix();
    	this.renderer.setSize( window.innerWidth, window.innerHeight ); 
    }

    keyDown(evt){
        switch(evt.keyCode){
            case 32:
                this.spaceKey = true; 
                break;
        }
    }
    
    keyUp(evt){
        switch(evt.keyCode){
            case 32:
                this.spaceKey = false;
                break;
        }
    }

    mouseDown(evt){
        this.spaceKey = true;
    }

    mouseUp(evt){
        this.spaceKey = false;
    }

	load(){
        this.loadSkybox();
        this.loading = true;
        this.loadingBar.visible = true;

        this.plane = new Plane(this);
        this.obstacles = new Obstacles(this);
    }

    loadSkybox(){
        this.scene.background = new THREE.CubeTextureLoader()
	        .setPath( `${this.assetsPath}plane/paintedsky/` )
            .load( [
                'px.jpg',
                'nx.jpg',
                'py.jpg',
                'ny.jpg',
                'pz.jpg',
                'nz.jpg'
            ], () => {
                this.renderer.setAnimationLoop(this.render.bind(this));
            } );
    }
    
    gameOver(){
        this.active = false;

        const gameover = document.getElementById('gameover');
        const btn = document.getElementById('playBtn');

        gameover.style.display = 'block';
        btn.style.display = 'block';
    }

    incScore(){
        this.score++;

        const elm = document.getElementById('score');

        elm.innerHTML = this.score;
    }

    decLives(){
        this.lives--;

        if (this.lives==0) this.gameOver();
        
    }
    checkPos(){
        if (this.plane.position.y >= 40 | this.plane.position.y <=-40){
            this.gameOver()
        }
    }
    updateCamera(){
        this.cameraController.position.copy( this.plane.position );
        this.cameraTarget.copy(this.plane.position);
        this.cameraTarget.z += 10;
        this.camera.lookAt( this.cameraTarget );
    }

	render() {
        if (this.loading){
            if (this.plane.ready && this.obstacles.ready){
                this.loading = false;
                this.loadingBar.visible = false;
            }else{
                return;
            }
        }

        const time = this.clock.getElapsedTime();

        this.plane.update(time);

        if (this.active){
            this.obstacles.update(this.plane.position);
        }
    
        this.updateCamera();
    
        this.renderer.render( this.scene, this.camera );

    }
}

export { Game };