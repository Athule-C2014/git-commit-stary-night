import * as THREE from './libs/three.module.js';

let speed = 0.1;
class car{

    constructor(worldCamera){
        this._camera = worldCamera;
        this._car = new THREE.Group();
        this._build_car();
        this._keyBind = {};

    }

    _create_wheels(){

        const geometry = new THREE.BoxBufferGeometry(12, 12, 33);
        const material = new THREE.MeshLambertMaterial({ color: 0x333333 });
        return new THREE.Mesh(geometry, material);
    }

    _create_body(){        
        const geometry = new THREE.BoxBufferGeometry(60, 15, 30);
        const material = new THREE.MeshLambertMaterial({ color: 0xFF0000 });
        return new THREE.Mesh(geometry, material);
    }

    _create_cabin(){
        const geometry = new THREE.BoxBufferGeometry(33, 12, 24);
        const material = new THREE.MeshLambertMaterial({ color: 0xffffff });
        return new THREE.Mesh(geometry, material);
    }

    _build_car(){

        const wheel_one = this._create_wheels();
        const wheel_two = wheel_one.clone();

        wheel_one.position.y = 6;
        wheel_one.position.x = -18;

        this._car.add(wheel_one);

        wheel_two.position.y = 6;
        wheel_two.position.x = 18;

        this._car.add(wheel_two);

        const body = this._create_body();
        body.position.y = 12;
        this._car.add(body);

        /* Sett Cabin Stuff */

        const carFrontTexture = this._getCarFrontTexture();

        const carBackTexture = this._getCarFrontTexture();
      
        const carRightSideTexture =this._getCarSideTexture();
      
        const carLeftSideTexture = this._getCarSideTexture();
        carLeftSideTexture.center = new THREE.Vector2(0.5, 0.5);
        carLeftSideTexture.rotation = Math.PI;
        carLeftSideTexture.flipY = false;

        const cabin = new THREE.Mesh(new THREE.BoxBufferGeometry(33, 12, 24), [
            new THREE.MeshLambertMaterial({ map: carFrontTexture }),
            new THREE.MeshLambertMaterial({ map: carBackTexture }),
            new THREE.MeshLambertMaterial({ color: 0xffffff }), // top
            new THREE.MeshLambertMaterial({ color: 0xffffff }), // bottom
            new THREE.MeshLambertMaterial({ map: carRightSideTexture }),
            new THREE.MeshLambertMaterial({ map: carLeftSideTexture }),
          ]);

        cabin.position.x = -6;
        cabin.position.y = 25.5;
        this._car.add(cabin);

    }

    get GetCar(){
        return this._car;
    }

    _getCarFrontTexture() {
        const canvas = document.createElement("canvas");
        canvas.width = 64;
        canvas.height = 32;
        const context = canvas.getContext("2d");
      
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, 64, 32);
      
        context.fillStyle = "#000000";
        context.fillRect(8, 8, 48, 24);
      
        return new THREE.CanvasTexture(canvas);
      }

     _getCarSideTexture() {
        const canvas = document.createElement("canvas");
        canvas.width = 128;
        canvas.height = 32;
        const context = canvas.getContext("2d");
      
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, 128, 32);
      
        context.fillStyle = "#000000";
        context.fillRect(10, 8, 38, 24);
        context.fillRect(58, 8, 60, 24);
      
        return new THREE.CanvasTexture(canvas);
      }

    bindKeyPress(keyCode, state){
        this._keyBind[keyCode] = state;
        //state -> (isPressed, isNotPressed)
    }


    animateCar(time){
        //this._car.rotation.y = time / 3000;
        const moveForward = this._keyBind['ArrowUp'] || this._keyBind['KeyW'];
        const moveBackward = this._keyBind['ArrowDown'] || this._keyBind['KeyS'];
        const turnLeft = this._keyBind['ArrowLeft'] || this._keyBind['KeyA'];
        const turnRight = this._keyBind['ArrowRight'] || this._keyBind['KeyD'];

        if (turnRight) {
            console.log(this._car.position);
            this._car.position.z += speed;
            this._camera.position.z += speed;
        }
        if (turnLeft) {
            console.log(this._car.position);
            this._car.position.z -= speed;
            this._camera.position.z -= speed;
        }
        if (moveForward) {
            console.log(this._car.position);
            this._car.position.x += speed;
            this._camera.position.x += speed;

            /*this._car.rotateY(0.01);
            this._camera.rotateY(0.01);*/
        }
        if (moveBackward) {
            console.log(this._car.position);
            this._car.position.x -= speed;
            this._camera.position.x -= speed;
            /*this._car.rotateY(-0.01);
            this._camera.rotateY(-0.01);*/
        }

        /*if (e.code === 'ArrowLeft' || e.code === 'KeyA'){

        }
        if (e.code === 'ArrowRight' || e.code === 'KeyD'){

        }*/
    }

}

export {car}