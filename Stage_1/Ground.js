import * as THREE from'./libs/three.module.js';

class Ground{

    constructor() {
        this._group = new THREE.Group();
        const WorldGround = this._generateGround();
        WorldGround.rotation.x = Math.PI/2;
        WorldGround.position.y -= 0.3;

        this._group.add(WorldGround);
    }

    _generateGround(){
        const TextureMap = new THREE.TextureLoader().load('./textures/g3.jpg');
        TextureMap.wrapS = THREE.RepeatWrapping;
        TextureMap.wrapT = THREE.RepeatWrapping;
        TextureMap.repeat.set(540,50);
        const geometry = new THREE.PlaneGeometry( 1080, 100, 5 );
        const material = new THREE.MeshBasicMaterial( {color: 0x60554e, side: THREE.DoubleSide , map:TextureMap ,roughness: 1} );
        const plane = new THREE.Mesh( geometry, material );
        return (plane);
    }

    get BuildFloor(){
        return this._group;
    }
}

export {Ground}