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
let isPaused = false;
let zombieMixers = [];

let directionalLight; // make directional light available globally for minimap tweak

// Player baseline height and movement bounds
const BASE_Y = 8.9;
const START_X = 905;
const MIN_X = 905; // can't go back beyond start
const MAX_X = -480; // end point

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
// If you truly removed fog globally, you can set scene.fog = null; otherwise keep as desired.
// scene.fog = null;
scene.fog = new THREE.Fog(0xffffff, 0, 500);
scene.add(new THREE.HemisphereLight(0xffffff));

// Main camera
camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.set(905, 8.9, 90);
camera.rotation.y = Math.PI / 2;

// ✅ Renderer setup with autoClear disabled
renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.autoClear = false;
document.body.appendChild(renderer.domElement);

// 🗺️ Mini-map orthographic camera
const mapSize = 150;
let mapAspect = window.innerWidth / window.innerHeight;
const mapCamera = new THREE.OrthographicCamera(
  -mapSize * mapAspect, mapSize * mapAspect,
  mapSize, -mapSize,
  1, 1000
);
mapCamera.position.set(camera.position.x, 300, camera.position.z);
mapCamera.up.set(0, 0, -1);
mapCamera.lookAt(camera.position.x, 0, camera.position.z);

// Resize handler
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);

  // main camera
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  // minimap camera
  mapAspect = window.innerWidth / window.innerHeight;
  mapCamera.left = -mapSize * mapAspect;
  mapCamera.right = mapSize * mapAspect;
  mapCamera.top = mapSize;
  mapCamera.bottom = -mapSize;
  mapCamera.updateProjectionMatrix();
});

// 💡 Lights (now assign to directionalLight var)
(function LightSetup() {
  directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
  directionalLight.position.set(-100, 0, 100);
  scene.add(directionalLight);

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

document.getElementById("resume_game").addEventListener("click", () => {
  isPaused = false;
  document.getElementById("pause_menu").style.display = "none";
  pControl.lock();
});

document.getElementById("quit_game").addEventListener("click", () => {
  window.location.href = "index.html";
});

const keys = {}; // keep track of which keys are held down

document.addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true;

  // Start sound only if a movement key is pressed
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(e.key.toLowerCase())) {
    if (sound.paused) sound.play();
  }

  // Update movement directions
  xdir = (keys['arrowright'] || keys['d'] ? 1 : 0) - (keys['arrowleft'] || keys['a'] ? 1 : 0);
  zdir = (keys['arrowup'] || keys['w'] ? 1 : 0) - (keys['arrowdown'] || keys['s'] ? 1 : 0);

  // Jump
  if (e.key === ' ' || e.key === 'Spacebar') {
    ti = Date.now();
    jump = true;
  }

  // Reload (R key)
  if (e.key.toLowerCase() === 'r') {
    window.location.reload();
  }
});

document.addEventListener('keyup', (e) => {
  keys[e.key.toLowerCase()] = false;

  // Update movement after releasing key
  xdir = (keys['arrowright'] || keys['d'] ? 1 : 0) - (keys['arrowleft'] || keys['a'] ? 1 : 0);
  zdir = (keys['arrowup'] || keys['w'] ? 1 : 0) - (keys['arrowdown'] || keys['s'] ? 1 : 0);

  // Stop sound only if no movement keys are still pressed
  if (
    !keys['arrowup'] && !keys['arrowdown'] &&
    !keys['arrowleft'] && !keys['arrowright'] &&
    !keys['w'] && !keys['a'] && !keys['s'] && !keys['d']
  ) {
    sound.pause();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'p' || e.key === 'Escape') {
    togglePause();
  }
});

function togglePause() {
  const pauseMenu = document.getElementById("pause_menu");

  if (!isPaused) {
    // Pause the game
    isPaused = true;
    pControl.unlock(); // release pointer lock
    pauseMenu.style.display = "block";
    sound.pause();
  } else {
    // Resume the game
    isPaused = false;
    pauseMenu.style.display = "none";
    pControl.lock();
    if (!sound.paused && (xdir !== 0 || zdir !== 0)) sound.play();
  }
}

// 📦 Collision mesh
const meshInMaterial = new THREE.MeshBasicMaterial({ visible: false });
const meshIn = new THREE.Mesh(new THREE.BoxGeometry(2, 25, 10), meshInMaterial);
scene.add(meshIn);

const playerMarker = new THREE.Mesh(
  new THREE.SphereGeometry(2, 8, 8),
  new THREE.MeshBasicMaterial({ color: 0x00ff00 })
);
scene.add(playerMarker);

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
          new THREE.BoxGeometry(3, 10, 25),
          new THREE.MeshBasicMaterial({ map: fireTexture, side: THREE.DoubleSide })
        );
        mesh.position.set(Xpos, -2, Zpos);
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
  const startX = camera.position.x + 70;

  for (let i = 0; i < 400; i++) {
    // --- First row ---
    const frontTree = tree._group.clone();
    frontTree.scale.set(40, 40, 40);
    frontTree.position.set(
      startX - i * 10,
      90,
      dir * (i % 2 === 0 ? 170 : 10)
    );
    scene.add(frontTree);
    blockingObjs.push(frontTree);

    // --- Second row (behind the first) ---
    const backTree = tree._group.clone();
    backTree.scale.set(40, 40, 40);
    backTree.position.set(
      startX - i * 6,
      90,
      dir * ((i % 2 === 0 ? 170 : 10) + 10) // push it further away
    );
    scene.add(backTree);
    blockingObjs.push(backTree);

    // --- Second row (behind the first) ---
    const backTree1 = tree._group.clone();
    backTree1.scale.set(40, 40, 40);
    backTree1.position.set(
      startX - i * 8,
      90,
      dir * ((i % 2 === 0 ? 170 : 10) -20) // push it further away
    );
    scene.add(backTree1);
    blockingObjs.push(backTree1);
  }
}


// 💀 Optimized zombie spawning
function spawnZombies() {
  const zombiePositions = [
    [870, 110], [800, 60], [400, 83],
    [300, 97], [200, 70], [650, 60],
    [100, 90], [-50, 90], [-120, 90], [-200, 60]
  ];

  const loader = new FBXLoader();
  const animLoader = new FBXLoader();

  loader.load('./models/zombie.fbx', (model) => {
    model.scale.set(0.07, 0.07, 0.07);
    model.traverse(d => d.castShadow = true);

    // Load animation once
    animLoader.load('./models/Walking.fbx', (anim) => {
      const clip = anim.animations[0];

      // For each zombie, reload the base FBX (to preserve skeleton binding)
      zombiePositions.forEach(([x, z]) => {
        loader.load('./models/zombie.fbx', (zombie) => {
          zombie.scale.set(0.07, 0.07, 0.07);
          zombie.position.set(x, -2, z);
          zombie.rotation.y = Math.random() * Math.PI * 2;
          zombie.traverse(d => d.castShadow = true);

          const mixer = new THREE.AnimationMixer(zombie);
          const action = mixer.clipAction(clip);
          action.play();

          zombieMixers.push(mixer);
          deadlyObjs.push(zombie);
          scene.add(zombie);
        });
      });
    });
  });
}

// 💎 Collectables
function generateCollectables() {
  const sphereGeo = new THREE.SphereGeometry(1, 16, 16);
  const sphereMat = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    emissive: 0xffff00,
    emissiveIntensity: 1
  });
  for (let i = 0; i < 20; i++) {
    let sphere = new THREE.Mesh(sphereGeo, sphereMat);
    sphere.position.set(850 - i * 50, 6, 80 + (Math.random() - 0.5) * 100);
    scene.add(sphere);
    collectables.push(sphere);
  }
}

// 🧱 End wall
const endWallGeometry = new THREE.BoxGeometry(5, 200, 400); // wide + tall
const endWallMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });
const endWall = new THREE.Mesh(endWallGeometry, endWallMaterial);
endWall.position.set(MAX_X - 3, 50, 80); // place just before the win trigger
endWall.receiveShadow = true;
endWallMaterial.visible = false;
scene.add(endWall);
blockingObjs.push(endWall); // also prevents walking through it



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
  // console.log(camera.position);

  if (isPaused) return;

  if (pControl.isLocked === true) {
    posF = Date.now();
    delta = (posF - posI) / 1000;
    let xDis = xdir * vel * delta;
    let zDis = zdir * vel * delta;

    if (jump) {
      t = ((Date.now() - ti) / 350) * 1.5;
      let yDist = yi + (vi * t) - (0.5 * 9.8 * Math.pow(t, 2));

      if (yDist <= BASE_Y) {
        jump = false;
        camera.position.y = BASE_Y; // restore camera to base height
      } else {
        camera.position.y = yDist;
      }
    } else {
      camera.position.y = BASE_Y; // keep fixed height when not jumping
    }

    pControl.moveRight(xDis);
    pControl.moveForward(zDis);

    // Prevent going backward
    if (camera.position.x > START_X) {
      camera.position.x = START_X;
    }
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
    // 🕳️ Fade to white before ending
    const fadeDiv = document.createElement("div");
    fadeDiv.style.position = "fixed";
    fadeDiv.style.top = 0;
    fadeDiv.style.left = 0;
    fadeDiv.style.width = "100%";
    fadeDiv.style.height = "100%";
    fadeDiv.style.background = "white";
    fadeDiv.style.opacity = 0;
    fadeDiv.style.transition = "opacity 1s ease";
    document.body.appendChild(fadeDiv);

    setTimeout(() => { fadeDiv.style.opacity = 1; }, 100); // fade in
    setTimeout(() => { location.href = "Done.html"; }, 1500); // redirect after fade
  }

  // ---------- Render sequence ----------
  const fullW = window.innerWidth;
  const fullH = window.innerHeight;

  // Clear once
  renderer.clear();

  // 1) Main full-screen render
  renderer.setViewport(0, 0, fullW, fullH);
  renderer.setScissorTest(false);
  renderer.render(scene, camera);

  // 2) Mini-map update and render
  playerMarker.position.copy(camera.position);
  mapCamera.position.set(camera.position.x, 300, camera.position.z);
  mapCamera.lookAt(camera.position.x, 0, camera.position.z);

  const mapWidth = Math.floor(fullW / 4);
  const mapHeight = Math.floor(fullH / 4);
  const margin = 20;
  const mapX = fullW - mapWidth - margin;
  const mapY = margin;

  // 🎥 Mini-map render (no fog, bright view) - make this robust:
  const oldFog = scene.fog;
  scene.fog = null; // temporarily disable fog

  // Save old directional light intensity if directionalLight exists
  const oldDirIntensity = directionalLight ? directionalLight.intensity : null;
  if (directionalLight) directionalLight.intensity = 1.5;

  // Save renderer clear color & alpha and set a local clear for mini-map
  const oldClearColor = renderer.getClearColor().clone();
  const oldClearAlpha = renderer.getClearAlpha();
  renderer.setClearColor(0x000000, 1); // minimap background

  renderer.clearDepth();
  renderer.setScissorTest(true);
  renderer.setScissor(mapX, mapY, mapWidth, mapHeight);
  renderer.setViewport(mapX, mapY, mapWidth, mapHeight);
  renderer.render(scene, mapCamera);
  renderer.setScissorTest(false);

  // restore fog + light + clear color
  scene.fog = oldFog;
  if (directionalLight && oldDirIntensity !== null) directionalLight.intensity = oldDirIntensity;
  renderer.setClearColor(oldClearColor);
  renderer.setClearAlpha(oldClearAlpha);
  // ---------- End render sequence ----------
}

animate();
