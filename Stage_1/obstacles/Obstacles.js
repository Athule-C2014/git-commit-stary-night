import * as THREE from '../libs/three.module.js';
import {wall} from "./wall.js";
import {cross} from "./cross.js";

class Obstacles{

    constructor() {
        this._obstacles_group = new THREE.Group();
        this._obstacles = [];
        this.get_walls();
        this.get_cross();
        this.get_spooky_walls();
    }

    get_Obstacles(){
        return this._obstacles.reverse(); // the objects are in reverse order initially.
    }

    remove_Obstacles(){ // remove the first element
        this._obstacles.shift();
    }

    add_obstacles(obj){ // add to the obstacle
        this._obstacles.push(obj);
    }



    set_position(object , array){
        object.position.x = array[0];
        object.position.y = array[1];
        object.position.z = array[2];
    }

    get_walls(){

        let walls = new wall();
        // A Vector contain the co-ordinates of the crates
        let position_obstacles = [
            [-500, 0,  -4] ,
            [-480 , 0 , 4] ,
            [-430 , 0 , 8] ,
            [-430 , 0 ,-5] ,
            [-400 , 0 , 3] ,
            [-380 , 0 ,-5] ,
            [-350 , 0 ,-0] ,
            [-330 , 0 , -2] ,
            [-310 , 0 , 4] ,
            [-280 , 0 ,-3] ,
            [-290 , 0 ,-5] ,
            [-270 , 0 ,0]  ,
            [-260 , 0 ,-0] ,
            [-240 , 0 , 2] ,
            [-220 , 0 , -6] ,
            [-200 , 0 , 4] ,
            [-170 , 0 ,-3] ,
            [-150 , 0 ,8] ,
            [-170 , 0 ,8] ,
            [-130 , 0 ,-3] ,
            [-100 , 0 ,5] ,
            [-70 , 0 ,-3] ,
            [-70 , 0 ,8] ,
            [-40 , 0 ,-3] ,
            [-40 , 0 ,8] ,
        ]

        for(let i = 0 ; i < position_obstacles.length ; i++) {
            let c = walls._generate_crate();
            this.set_position(c,position_obstacles[i]);
            this.add_obstacles(c);
            this._obstacles_group.add(c);
        }

    }


    get_spooky_walls(){
        let DC = new wall();
        let darkCrate= DC._create_darkCrate();

        let position_obstacles = [
            [40 , 0 , -6] ,
            [70 , 0 , -4] ,
            [90 , 0 , 8] ,
            [120 , 0 ,-5] ,
            [160 , 0 , 3] ,
            [190, 0 ,-5] ,
            [220 , 0 ,-0],
            [250 , 0 ,-4] ,
            [250 , 0 ,7] ,
            [280 , 0 ,0] ,
            [280 , 0 ,7] ,
            [300 , 0 ,3] ,
            [310 , 0 ,-6] ,
            [350 , 0 ,5] ,
            [360 , 0 ,-3] ,
            [300 , 0 ,3] ,
            [310 , 0 ,-6] ,
            [350 , 0 ,5] ,
            [360 , 0 ,-3] ,
            [390 , 0 ,1] ,
            [390 , 0 ,-6] ,
            [400 , 0 ,3] ,
            [400 , 0 ,-8] ,
            [420 , 0 ,0]

        ]

        for(let i = 0 ; i < position_obstacles.length ; i++) {
            let c = darkCrate.clone();
            this.set_position(c,position_obstacles[i]);
            this.add_obstacles(c);
            this._obstacles_group.add(c);
        }
    }

    get_cross(){
        let Cross = new cross();

        let position_obstacles = [
            [15,0,-4],
            [15,0,-7],
            [30, 0 , 7],
            [50 , 0, 0],
            [50,0,2],
            [70,0,6],
            [110 , 0, 2],
            [132,0,2],
            [130,0,6],
            [150 , 0 , 5],
            [150 , 0, 0],
            [170,0,2],
            [190,0,6]

        ]

        for(let i = 0 ; i < position_obstacles.length ; i++) {
            let c = Cross.create_shape();
            this.set_position(c,position_obstacles[i]);
            c.rotation.x = 0;
            this.add_obstacles(c);
            this._obstacles_group.add(c);
        }
    }

    get GetObstacles(){
        return this._obstacles_group;
    }


}
export {Obstacles}