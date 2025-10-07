import * as THREE from '../libs/three.module.js';
import {Mesh} from "../libs/three.module.js";

class wall{

        constructor() {
                this._crates = new THREE.Group();
        }

        _generate_crate(width){

                let textureLoader = new THREE.TextureLoader();
                let crateTexture = textureLoader.load("textures/crate2_diffuse.png");
                let crateBumpMap = textureLoader.load("textures/crate2_bump.png");
                let crateNormalMap = textureLoader.load("textures/crate2_normal.png");

                // Create mesh with these textures
            return new THREE.Mesh(
                    new THREE.BoxGeometry(3, 8, 8),
                    new THREE.MeshPhongMaterial({
                        shininess:0,
                        color:0x654321,
                        map: crateTexture,
                        bumpMap: crateBumpMap,
                        normalMap: crateNormalMap
                    })
                );
        }

        _create_darkCrate(){
            let textureLoader = new THREE.TextureLoader();
            let crateTexture = textureLoader.load("textures/diffuse.jpg");
            let crateBumpMap = textureLoader.load("textures/diffuse.jpg");
            let crateNormalMap = textureLoader.load("textures/normal.png");
            // Create mesh with these textures
            return new THREE.Mesh(
                new THREE.BoxGeometry(3, 8, 8),
                new THREE.MeshPhongMaterial({
                    shininess:0,
                    color:0x654321,
                    map: crateTexture,
                    bumpMap: crateBumpMap,
                    normalMap: crateNormalMap
                })
            );
        }

        gen_Gate(){
            let textureLoader = new THREE.TextureLoader();
            let crateTexture = textureLoader.load("textures/Gate.png");
            let crateBumpMap = textureLoader.load("textures/Gate.png");
            let crateNormalMap = textureLoader.load("textures/S_gate.png");
            // Create mesh with these textures
            return new THREE.Mesh(
                new THREE.BoxGeometry(18, 8, 18),
                new THREE.MeshPhongMaterial({
                    shininess:0,
                    map: crateTexture,
                    bumpMap: crateBumpMap,
                    normalMap: crateNormalMap
                })
            );
        }

        get GetWalls(){
                return this._crates;
        }
}

export {wall}