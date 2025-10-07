import * as THREE from '../libs/three.module.js';

class Rocks{
    constructor() {
        this._rocks = new THREE.Group();
        this._gen_small_rocks();
    }

    _create_smallRock(){
        const geometry = new THREE.SphereGeometry( 1.5, 4, 8,0,6.3,0,4.4);
        const material = new THREE.MeshPhongMaterial( {color: 0x6f4e30,
                specular:0x000000,
                shininess:0



        } );
        return new THREE.Mesh( geometry, material );
    }

    _gen_small_rocks(){
        let stone = this._create_smallRock();

        for(let i = 0 ; i < 2 ;i++){
            let new_stone = stone.clone();
            new_stone.position.x = -500 + i*20;
            this._rocks.add(new_stone);
        }
    }

    get SmallRocks(){
        return this._rocks;
    }

}
export {Rocks}