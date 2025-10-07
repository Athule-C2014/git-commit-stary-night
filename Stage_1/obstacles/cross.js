import * as THREE from '../libs/three.module.js';

class cross {

    constructor() {
        this._cross = new THREE.Group();
    }

    create_shape() {
        let textureLoader = new THREE.TextureLoader();
        let crateTexture = textureLoader.load("textures/dark_leaf.png");
        let crateBumpMap = textureLoader.load("textures/dark_leaf.png");
        let crateNormalMap = textureLoader.load("textures/normal_skin.png");

        // Create mesh with these textures
        return new THREE.Mesh(
            new THREE.ConeGeometry(2.5, 10, 10,10),
            new THREE.MeshPhongMaterial({
                shininess:0,
                color:0x696969,
                map: crateTexture,
                bumpMap: crateBumpMap,
                normalMap: crateNormalMap
            })
        );

    }
    get GetCross(){
        return this._cross;
    }
}
export {cross}
