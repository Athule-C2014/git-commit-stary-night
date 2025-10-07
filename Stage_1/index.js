import * as THREE from './libs/three.module.js';
import * as CONTROL from './libs/OrbitControls.js';
import {Ground} from "./Ground.js";
import {Tree} from "./obstacles/Tree.js";
import {OldCar} from "./3DCar.js";
import {Obstacles} from "./obstacles/Obstacles.js";
import {wall} from "./obstacles/wall.js";

let GameState;
let scene , camera, renderer,controls,car3d , obstacle = [];
let OldX = 0;

const StartButton = document.getElementById("play_game"); // Get the Start Button
StartButton.addEventListener('click',() => {
        let menu = document.getElementById("menu"); // Get the Menu Dom
        menu.style.display = "none" // Hide the Menu
        CreateEnvironment(); // Create Environment
        GameState = true; // Game is Playable
});


let resume = document.getElementById("resume_game"); // Get the resume Button DOM
let PauseMenu = document.getElementById("pause_menu"); // get the PauseMenu Button DOM
    resume.addEventListener('click',() => {
        PauseMenu.style.display = "none" // Hide the pause menu
        car3d.returnGame(); // returns the GameState to True
    });


const CreateEnvironment = () => {

    scene = new THREE.Scene();

    CameraSetUp();      // Creates the Camera
    LightSetup();       // Adds the Lights to the Scene
    RendererSetUp();    // Sets up the Renderer
    ControlsSetUp();    // Initialises the Controls for thr Player

    window.addEventListener('resize',()=>{
        renderer.setSize(window.innerWidth,window.innerHeight);
        camera.aspect = window.innerWidth/window.innerHeight;
        camera.updateProjectionMatrix();
    });

    AddMiscObjects();

}

const animate = (time) =>{

    if(GameState && car3d.isPlayable()){
        car3d.animateCar(time , obstacle);
        OptimiseObstacles();
    }
    renderer.render(scene,camera);
}

const LoadCar = () => {
    const carEngine = document.getElementById("engine");
    car3d = new OldCar(carEngine, camera);
    car3d.getCar().then(carObj => {
        scene.add(carObj);
    });
}

const genTree = (dir = 1) =>{

    let tree = new Tree("light");

    for(let i = 0;i < 500;i++){

        let j = -520;
        let clone_tree = tree._group.clone();
        clone_tree.scale.set(3,3,3);
        clone_tree.position.x += i + j - 10;
        clone_tree.position.y += 5;
        if(i % 2 === 0) {
            clone_tree.position.z += dir * 10;
        }
        else{
            clone_tree.position.z += dir * 9;
        }
        scene.add(clone_tree);

    }
}

const genTreeDark = (dir = 1) =>{

    let tree = new Tree("dark");

    for(let i = 0;i < 500;i++){

        let j = -20;
        let clone_tree = tree._group.clone();

        clone_tree.scale.set(3,3,3);
        clone_tree.position.x += i + j - 10;
        clone_tree.position.y += 5;

        if(i % 2 === 0) {
            clone_tree.position.z += dir * 10;
        }
        else{
            clone_tree.position.z += dir * 9;
        }
        scene.add(clone_tree);

    }
}



const LightSetup = () =>{

    let ambient = new THREE.AmbientLight(0xFFFFFF); //some ambient lighting to reveal the smoke
    scene.add(ambient);

    const spotLight = new THREE.SpotLight( 0xffffff );
    spotLight.position.set( 100, 100, 100 );
    scene.add( spotLight );

    const spotLightRed = new THREE.SpotLight( 0xff0000 );
    spotLight.position.set( 0, 5, 0 );
    scene.add( spotLightRed );


    let keyLight = new THREE.DirectionalLight(new THREE.Color('hsl(38,10%,84%)'), 1.0);
    keyLight.position.set(-500, 0, 100);

    let fillLight = new THREE.DirectionalLight(new THREE.Color('hsl(240,11%,93%)'), 0.75);
    fillLight.position.set(500, 0, 100);

    let backLight = new THREE.DirectionalLight(0xffffff, 1.0);
    backLight.position.set(100, 0, -100).normalize();

    let moon = new THREE.DirectionalLight(new THREE.Color('hsl(38,10%,84%)'), 1.0);
    keyLight.position.set(-500, 50, 0);

    scene.add(moon);
    scene.add(keyLight);
    scene.add(fillLight);
    scene.add(backLight);
}

const setupKeyControls = () => {
    document.onkeydown = function(e) {
        car3d.bindKeyPress(e.key, true);
    }

    document.onkeyup = function (e) {
        car3d.bindKeyPress(e.key, false);
    }
}

function CreateSky(){
    const loader = new THREE.TextureLoader();
    scene.background = loader.load('./textures/front.png');
}
const CameraSetUp = () =>{
    camera = new THREE.PerspectiveCamera(50,window.innerWidth/window.innerHeight,0.1,200);
    camera.position.x = -513;
    camera.position.y += 0.9;
    camera.position.z = -3;
}

const RendererSetUp = () => {
    renderer = new THREE.WebGLRenderer({antialias : true});
    renderer.setSize(window.innerWidth,window.innerHeight);
    renderer.setAnimationLoop(animate);
    document.body.appendChild(renderer.domElement);
}
const ControlsSetUp = () =>{
    controls = new CONTROL.OrbitControls(camera,renderer.domElement);
    // to disable zoom
    controls.enableZoom = false;
    // to disable rotation
    controls.enableRotate = false;
    // to disable pan
    controls.enablePan = false;
}

const AddMiscObjects = () => {
    let floor = new Ground();
    scene.add(floor.BuildFloor);

    genTree();
    genTree(-1);
    genTreeDark(1)
    genTreeDark(-1);
    CreateSky();

    LoadCar(); //loads the 3d Model
    setupKeyControls(); // movement

    let obj_array = new Obstacles();
    obstacle = obj_array.get_Obstacles(); // assign global obstacle array
    scene.add(obj_array.GetObstacles);

    let test = new wall();
    let gate = test.gen_Gate();
    gate.position.x = 480;
    gate.position.y = 3.5;
    scene.add(gate);
}

const OptimiseObstacles = () =>{
    if(car3d){
        if(Math.abs(OldX - car3d._car.position.x) > 25){
            obstacle.pop();
            OldX = car3d._car.position.x;
        }

        if (car3d._car.position.x > 420){
            scene.fog = new THREE.FogExp2(0x000000,0.02);
        }
    }
}