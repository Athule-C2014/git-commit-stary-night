import {GLTFLoader} from './GLTFLoader.js';
import * as THREE from "./libs/three.module.js";

let GameState = true;
class OldCar {

    constructor(carEngine, camera) {
        this._car = new THREE.Group();
        this._keyBind = {};
        this._camera = camera;
        this._engineSound = carEngine;
        this._obj = null;

        //load model
        this.gltfLoader = new GLTFLoader();
        this.gltfLoader.load('models/old_car/scene.gltf', (model) => {
            let car_child = model.scene.children[0];
            car_child.scale.set(0.01, 0.01, 0.01);
            car_child.position.set(-510, 0.1, -3);
            this._obj = car_child;

            if(this._obj){
            //  Adding HeadLights to the Car
                const RightHeadLight = new THREE.SpotLight( 0xFFBF00 ,1,100,Math.PI/5);
                RightHeadLight.position.set(-510, 0.1, -2.5);

                const LeftHeadLight = new THREE.SpotLight( 0xFFBF00 ,1,100,Math.PI/5);
                LeftHeadLight.position.set(-510, 0.1, -3.5);

                this._car.add(RightHeadLight);
                this._car.add(LeftHeadLight);
                this._car.add(this._obj);

            }
        });

    }

    set setCar(car){
        this._obj = car;
    }


    getCar(){
        return new Promise((resolve, reject) => { //asynchronous
            const checkUpIntervalId = setInterval(() => {
                if (this._obj != null){
                    clearInterval(checkUpIntervalId);
                    resolve(this._car);
                }
            }, 300);
        });
    }

    isAudioPlaying(){
        return this._keyBind['ArrowUp'] || this._keyBind['KeyW']
            || this._keyBind['ArrowDown'] || this._keyBind['KeyS']
            || this._keyBind['ArrowLeft'] || this._keyBind['KeyA']
            || this._keyBind['ArrowRight'] || this._keyBind['KeyD'];
    }

    bindKeyPress(keyCode, state) {
        this._keyBind[keyCode] = state;

        if (state === true){
            this._engineSound.volume = 0.1;
            this._engineSound.play();
        }
        else{
            if (!this.isAudioPlaying()){
                this._engineSound.pause();
            }
        }

    }

    isPlayable(){
        return GameState;
    }

    returnGame(){
        GameState = true;
    }

    cue_music() {
        if (this._car) {
            if (this._car.position.x >= 400) {
                const Noise = document.getElementById("scary");
                Noise.volume = 0.2;
                Noise.play();
            }
        }
    }

    movement(time){

        const speed = 0.3;
        let position_y = 0.0005 * Math.sin(time / 500);

        const moveForward = this._keyBind['ArrowUp'] || this._keyBind['w'];
        const moveBackward = this._keyBind['ArrowDown'] || this._keyBind['s'];
        const turnLeft = this._keyBind['ArrowLeft'] || this._keyBind['a'];
        const turnRight = this._keyBind['ArrowRight'] || this._keyBind['d'];
        const Camera = this._keyBind['c'];
        const Pause = this._keyBind['Escape']
        const Test = this._keyBind['g']

        if (turnRight) {

            this._car.position.y += position_y;

            if(this._car.position.z > 10){
                this._car.position.z = 10;
                this._camera.position.z = 7;
            }
            this._car.position.z += speed;
            this._camera.position.z += speed;

        }
        if (turnLeft) {

            this._car.position.y += position_y;

            if(this._car.position.z < -4){
                this._car.position.z = -4;
                this._camera.position.z = -7;
            }

            this._car.position.z -= speed;
            this._camera.position.z -= speed;
        }
        if (moveForward) {

            this._car.position.y += position_y;
            this._car.position.x += speed;
            this._camera.position.x += speed;
        }
        if (moveBackward) {

            this._car.position.y += position_y;
            this._car.position.x -= speed;
            this._camera.position.x -= speed;

        }

        if(Camera){
                if(this._camera.position.y === 0.9){
                    this._camera.position.y = 1.2;
                }
                else{
                    this._camera.position.y = 0.9;
                }
        }

        if(Pause){
            let resume_menu = document.getElementById("pause_menu")
            resume_menu.style.display = "block";
            GameState = false;
        }

        if(Test){
            console.log(this._car.position.x);
        }

    }


    animateCar(time,obstacle = []) {

        this.movement(time);
        this.cue_music();

        this._obstacles_array = obstacle;
        if(this._obj) {
            if(this._car.position.x >= 950){
                console.log(this._car.position.x)
                const Noise = document.getElementById("scary");
                Noise.pause();
                let win_menu = document.getElementById("win")
                win_menu.style.display = "block";
                GameState = false;
                const Laugh = document.getElementById("laugh");
                Laugh.play();
            }

            let BoundingBox = new THREE.Box3().setFromObject(this._obj);
            for(let i = 0 ; i < obstacle.length ; i++ ){
                let object =  new THREE.Box3().setFromObject(obstacle[i]);
                let intersect = BoundingBox.intersectsBox(object);
                if(intersect){
                    location.href = "gave_over.html";
                }
            }

        }
    }
}

export {OldCar}
