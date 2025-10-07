import * as THREE from '../libs/three.module.js';

class Gate{
    constructor() {
        this._gate = new THREE.Group();
        this._Create_bridge();

    }

    _create_Column(){
        const geometry = new THREE.BoxGeometry( 3, 10, 0.5 );
        const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
        return new THREE.Mesh(geometry, material);
    }

    _create_Top(){
        let TextureLoader = new THREE.TextureLoader().load('./textures/bones.png')
        TextureLoader.wrapS = THREE.RepeatWrapping;
        TextureLoader.wrapT = THREE.RepeatWrapping;
        TextureLoader.repeat.set(5,5);
        const geometry = new THREE.RingGeometry( 5, 8, 32  , 1,0 , 3);
        const material = new THREE.MeshBasicMaterial( { color: 0x808080, side: THREE.DoubleSide , map:TextureLoader } );
        return new THREE.Mesh(geometry, material);
    }

    _Create_bridge(){

        let top = this._create_Top();
        top.position.y = 5;
        top.rotation.y = Math.PI/2;
        let LeftColumn = this._create_Column();
        LeftColumn.position.z = -6;
        LeftColumn.position.x = top.position.x;
        LeftColumn.rotation.y = Math.PI/2;
        let RightColumn = this._create_Column();
        RightColumn.rotation.y = Math.PI/2;

        this._gate.add(top);
        this._gate.add(LeftColumn);
        this._gate.add(RightColumn);

    }

    get GetBridge(){
        return this._gate;
    }


}
export {Gate}