import * as THREE from './three.js-master/build/three.module.js';
import { PointerLockControls } from './three.js-master/examples/jsm/controls/PointerLockControls.js';
import { FBXLoader } from './three.js-master/examples/jsm/loaders/FBXLoader.js';
import { Scenediscriptor } from './Scenediscriptor.js';
import { Tree } from './Tree.js';

let scene, camera, renderer, pControl;
let xdir = 0, zdir = 0;
let posI, posF, vel, delta;
let jump = false, yi, vi, t, ti;
let collidableObjs = [];
let deadlyObjs = [];
let blockingObjs = [];

let zombieMixers = [];

const sound = document.getElementById("running");
const scream = document.getElementById("Scream");

// 🧮 Score UI
let score = 0;
let scoreDisplay = document.createElement('div');
scoreDisplay.style.position = 'absolute';
scoreDisplay.style.top = '20px';
scoreDisplay.style.left = '20px';
scoreDisplay.style.color = 'white';
scoreDisplay.style.fontSize = '24px';
scoreDisplay.style.fontFamily = 'monospace';
scoreDisplay.innerHTML = `Score: ${score}`;
document.body.appendChild(scoreDisplay);

let collectables = [];

// 🎮 Scene setup
scene = new THREE.Scene();
const loader = new THREE.CubeTextureLoader();
const texture = loader.load([
  './models/xpos.png', './models/xneg.png',
  './models/ypos.png', './models/yneg.png',
  './models/zpos.png', './models/zneg.png'
]);
scene.background = texture;
scene.fog = new THREE.Fog(0xffffff, 0, 500);
scene.add(new THREE.HemisphereLight(0xffffff));

camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.set(905, 8.9, 97);

renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

// 💡 Lights
(function LightSetup() {
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
  keyLight.position.set(-100, 0, 100);
  scene.add(keyLight);
  scene.add(new THREE.AmbientLight(0xffffff, 0.4));
})();

// 🪵 Ground
const groundtexture = new THREE.TextureLoader().load('./models/g3.jpg');
groundtexture.wrapS = groundtexture.wrapT = THREE.RepeatWrapping;
groundtexture.repeat.set(10, 25);
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(2000, 5000, 5),
  new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, map: groundtexture })
);
ground.rotation.x = Math.PI / 2;
ground.position.y = -10;
scene.add(ground);

// 🎮 Controls
pControl = new PointerLockControls(camera, renderer.domElement);
document.getElementById('play_game').onclick = () => {
  document.getElementById("menu").style.display = "none";
  pControl.lock();
};

// ⌨️ Movement
document.addEventListener('keydown', (e) => {
  switch (e.keyCode) {
    case 37: sound.play(); xdir = -1; break;
    case 38: sound.play(); zdir = 1; break;
    case 39: sound.play(); xdir = 1; break;
    case 40: sound.play(); zdir = -1; break;
    case 32: ti = Date.now(); jump = true; break;
  }
});
document.addEventListener('keyup', (e) => {
  switch (e.keyCode) {
    case 37:
    case 38:
    case 39:
    case 40:
      sound.pause(); xdir = zdir = 0; break;
    case 82:
      window.location.reload(); break;
  }
});

// 📦 Collision mesh
const meshInMaterial = new THREE.MeshBasicMaterial({ visible: false });
const meshIn = new THREE.Mesh(new THREE.BoxGeometry(5, 25, 10), meshInMaterial);
scene.add(meshIn);

// 🔥 Build stage (obstacles)
function buildStage(sceneFaceSet) {
  let Xpos = 820;
  for (let i = 0; i < sceneFaceSet.length; i++) {
    const row = sceneFaceSet[i];
    let Zpos = 50;
    for (let j = 0; j < row.length; j++) {
      if (row[j] === 1) {
        const fireTexture = new THREE.TextureLoader().load('./models/fire.jpg');
        const mesh = new THREE.Mesh(
          new THREE.BoxGeometry(5, 10, 25),
          new THREE.MeshBasicMaterial({ map: fireTexture, side: THREE.DoubleSide })
        );
        mesh.position.set(Xpos, 0, Zpos);
        scene.add(mesh);
        deadlyObjs.push(mesh); // only deadly objects here
      }
      Zpos += 10;
    }
    Xpos -= 10;
  }
}

// 🌲 Tree generation (now blocking)
function genTree(dir = 1) {
  const tree = new Tree("light");
  const startX = camera.position.x + 50; // start a bit ahead of the player
  const endX = -500;                     // extend to far end of runway

  for (let i = 0; i < 400; i++) {
    const clone_tree = tree._group.clone();
    clone_tree.scale.set(40, 40, 40);
    clone_tree.position.set(
      startX - i * 10, // gradual placement along the runway
      90,
      dir * (i % 2 === 0 ? 150 : 15)
    );
    scene.add(clone_tree);
    blockingObjs.push(clone_tree);
  }
}

// 💀 Optimized zombie spawning
function spawnZombies() {
  const loader = new FBXLoader();
  loader.load('./models/zombie.fbx', (model) => {
    model.scale.set(0.07, 0.07, 0.07);
    model.traverse(d => d.castShadow = true);

    const animLoader = new FBXLoader();
    animLoader.load('./models/Walking.fbx', (anim) => {
      const clip = anim.animations[0];
      const positions = [
        [870, 110], [800, 60], [400, 83],
        [300, 97], [200, 70], [650, 60],
        [100, 90], [-50, 90], [-120, 90], [-200, 60]
      ];

      positions.forEach(([x, z]) => {
        const zombie = model.clone(true); // deep clone with bones
        zombie.position.set(x, 0, z);

        const mixer = new THREE.AnimationMixer(zombie);
        const action = mixer.clipAction(clip);
        action.play();

        zombieMixers.push(mixer);
        zombie.rotation.y = Math.random() * Math.PI * 2;
        scene.add(zombie);
        deadlyObjs.push(zombie);
      });
    });
  });
}

// 💎 Collectables
function generateCollectables() {
  const sphereGeo = new THREE.SphereGeometry(5, 16, 16);
  const sphereMat = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    emissive: 0xffff00,
    emissiveIntensity: 1
  });
  for (let i = 0; i < 20; i++) {
    let sphere = new THREE.Mesh(sphereGeo, sphereMat);
    sphere.position.set(850 - i * 50, 10, 80 + (Math.random() - 0.5) * 100);
    scene.add(sphere);
    collectables.push(sphere);
  }
}

// 🚀 Init
const sceneFaceSet = new Scenediscriptor().Scene1;
buildStage(sceneFaceSet);
genTree();
spawnZombies();
generateCollectables();

posI = Date.now();
vel = 50;
yi = 10;
vi = 20;

const clock = new THREE.Clock();

function checkForCollisions() {
  const playerBox = new THREE.Box3().setFromObject(meshIn);

  // 💀 Check deadly collisions
  for (let i = 0; i < deadlyObjs.length; i++) {
    const objectBox = new THREE.Box3().setFromObject(deadlyObjs[i]);
    if (playerBox.intersectsBox(objectBox)) {
      scream.play();
      location.href = "game_over.html";
      return;
    }
  }

  // 🪵 Check blocking collisions — stop forward motion
  for (let i = 0; i < blockingObjs.length; i++) {
    const objectBox = new THREE.Box3().setFromObject(blockingObjs[i]);
    if (playerBox.intersectsBox(objectBox)) {
      // reverse last movement slightly to simulate blocking
      pControl.moveForward(-zdir * 5);
      pControl.moveRight(-xdir * 5);
      break;
    }
  }
}

// 🎮 Animation loop
function animate() {
  const c = clock.getDelta();
  zombieMixers.forEach(m => m.update(c));
  requestAnimationFrame(animate);

  if (pControl.isLocked === true) {
    posF = Date.now();
    delta = (posF - posI) / 1000;
    let xDis = xdir * vel * delta;
    let zDis = zdir * vel * delta;

    if (jump) {
      t = ((Date.now() - ti) / 350) * 1.5;
      let yDist = yi + (vi * t) - (0.5 * 9.8 * Math.pow(t, 2));
      if (yDist <= yi) jump = false;
      camera.position.y = yDist;
    }

    pControl.moveRight(xDis);
    pControl.moveForward(zDis);
    posI = posF;
  }

  meshIn.position.set(camera.position.x, camera.position.y, camera.position.z);
  checkForCollisions();

  // ✅ Collectable check
  for (let i = collectables.length - 1; i >= 0; i--) {
    const sphere = collectables[i];
    const playerBox = new THREE.Box3().setFromObject(meshIn);
    const sphereBox = new THREE.Box3().setFromObject(sphere);
    if (playerBox.intersectsBox(sphereBox)) {
      scene.remove(sphere);
      collectables.splice(i, 1);
      score++;
      scoreDisplay.innerHTML = `Score: ${score}`;
    }
  }

  // 🏁 Win condition
  if (camera.position.x <= -473) {
    alert(`You reached the end! Final score: ${score}`);
    location.href = "Done.html";
  }

  renderer.render(scene, camera);
}

animate();
