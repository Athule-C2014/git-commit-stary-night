import * as THREE from '../libs/three.module.js';

class Tree{

    constructor(type = 'light'){
        this._group = new THREE.Group();

        if(type === 'light') {
            this._buildTreeTop();
            this._buildTreeBottom();
        }
        else{
            this._buildDarkTreeTop('./textures/flame.jpg');
            this._buildDarkTreeBottom('./textures/red_bark.jpg');
        }

    }


    _buildTreeTop(){
        const treeTop = this._generateCone();
        const treegroup = new THREE.Group();
        treegroup.add(treeTop);

        for ( let i = 0 ; i < 10;i++){

            const newTopPart = treeTop.clone();
            newTopPart.position.y -= i* 0.13;
            treegroup.add(newTopPart);
        }

        treegroup.position.y += 0.3;
        this._group.add(treegroup);
    }

    _buildDarkTreeTop(){
        const treeTop = this._generateDarkCone();
        const treegroup = new THREE.Group();
        treegroup.add(treeTop);

        for ( let i = 0 ; i < 5;i++){

            const newTopPart = treeTop.clone();
            newTopPart.position.y -= i* 0.25;
            treegroup.add(newTopPart);
        }

        treegroup.position.y += 0.3;
        this._group.add(treegroup);
    }

    _buildTreeBottom(){
        const treebottom = this._generateCylinder();
        treebottom.position.y -= 1;
        this._group.add(treebottom);

    }

    _buildDarkTreeBottom(){
        const treebottom = this._generateCylinder("./textures/red_bark.jpg");
        treebottom.position.y -= 1;
        this._group.add(treebottom);

    }
    _generateCone(texture = './textures/tree.jpg'){
        const TextureLoader = new THREE.TextureLoader().load(texture);
        TextureLoader.wrapS = THREE.RepeatWrapping;
        TextureLoader.wrapT = THREE.RepeatWrapping;
        TextureLoader.repeat.set(5,5);

        const geometry = new THREE.ConeGeometry( 0.5, 1, 32 );
        const material = new THREE.MeshBasicMaterial( {color: 0x006400, map:TextureLoader} );
        return new THREE.Mesh(geometry, material);

    }
    _generateDarkCone(){
        let TextureLoader = new THREE.TextureLoader().load("textures/flames.jpg");
        TextureLoader.wrapS = THREE.RepeatWrapping;
        TextureLoader.wrapT = THREE.RepeatWrapping;
        TextureLoader.repeat.set(5,5);

        const geometry = new THREE.ConeGeometry( 0.6, 1.2, 5 );
        const material = new THREE.MeshBasicMaterial( {map:TextureLoader} );
        return new THREE.Mesh(geometry, material);

    }

    _generateCylinder(texture ='./textures/bark.jpg'){
        const barkTexture = new THREE.TextureLoader().load(texture);
        const geometry = new THREE.CylinderGeometry( 0.2, 0.2, 2, 32 );
        const material = new THREE.MeshBasicMaterial( {color: 0xD2691E,map:barkTexture});
        return new THREE.Mesh(geometry, material);
    }        

    get getTree(){
        return this._group;
    }

}

export {Tree};