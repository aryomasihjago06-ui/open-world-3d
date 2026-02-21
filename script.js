const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 2000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// LIGHT
const sun = new THREE.DirectionalLight(0xffffff, 1);
sun.position.set(100, 200, 100);
sun.castShadow = true;
scene.add(sun);

const ambient = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambient);

// DAY NIGHT SYSTEM
let time = 0;
function updateDayNight() {
  time += 0.002;
  const intensity = Math.sin(time) * 0.5 + 0.5;
  sun.intensity = intensity;
  scene.background = new THREE.Color().setHSL(0.6, 0.5, intensity);
}

// GROUND
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(1000, 1000),
  new THREE.MeshStandardMaterial({ color: 0x3cb043 })
);
ground.rotation.x = -Math.PI/2;
ground.receiveShadow = true;
scene.add(ground);

// PLAYER
const player = new THREE.Mesh(
  new THREE.BoxGeometry(1,2,1),
  new THREE.MeshStandardMaterial({ color: 0x0000ff })
);
player.position.y = 1;
player.castShadow = true;
scene.add(player);

// CAR
const car = new THREE.Mesh(
  new THREE.BoxGeometry(3,1,2),
  new THREE.MeshStandardMaterial({ color: 0xff0000 })
);
car.position.set(10,0.5,10);
car.castShadow = true;
scene.add(car);

let inCar = false;

// TREES
for(let i=0;i<50;i++){
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5,0.5,4),
    new THREE.MeshStandardMaterial({ color: 0x8B4513 })
  );
  trunk.position.set((Math.random()-0.5)*800,2,(Math.random()-0.5)*800);
  
  const leaves = new THREE.Mesh(
    new THREE.SphereGeometry(2),
    new THREE.MeshStandardMaterial({ color: 0x006400 })
  );
  leaves.position.y = 4;
  trunk.add(leaves);
  scene.add(trunk);
}

// MOUNTAINS
for(let i=0;i<10;i++){
  const mountain = new THREE.Mesh(
    new THREE.ConeGeometry(20,50,4),
    new THREE.MeshStandardMaterial({ color: 0x777777 })
  );
  mountain.position.set((Math.random()-0.5)*900,25,(Math.random()-0.5)*900);
  scene.add(mountain);
}

// ENEMIES
const enemies = [];
for(let i=0;i<5;i++){
  const enemy = new THREE.Mesh(
    new THREE.BoxGeometry(1,2,1),
    new THREE.MeshStandardMaterial({ color: 0xff00ff })
  );
  enemy.position.set((Math.random()-0.5)*200,1,(Math.random()-0.5)*200);
  scene.add(enemy);
  enemies.push(enemy);
}

// MOVEMENT
const keys = {};
document.addEventListener("keydown", e => keys[e.key]=true);
document.addEventListener("keyup", e => keys[e.key]=false);

document.addEventListener("keydown", e=>{
  if(e.key==="e"){
    if(player.position.distanceTo(car.position)<5){
      inCar=!inCar;
    }
  }
});

function move(){
  const speed = inCar?0.8:0.3;
  const target = inCar?car:player;

  if(keys["w"]) target.position.z-=speed;
  if(keys["s"]) target.position.z+=speed;
  if(keys["a"]) target.position.x-=speed;
  if(keys["d"]) target.position.x+=speed;

  if(inCar){
    player.position.copy(car.position);
    player.position.y=1;
  }
}

// ENEMY AI
function updateEnemies(){
  enemies.forEach(enemy=>{
    const dir = new THREE.Vector3().subVectors(player.position, enemy.position).normalize();
    enemy.position.add(dir.multiplyScalar(0.05));
  });
}

// CAMERA FOLLOW
function updateCamera(){
  camera.position.set(player.position.x, player.position.y+8, player.position.z+15);
  camera.lookAt(player.position);
}

// LOOP
function animate(){
  requestAnimationFrame(animate);
  move();
  updateEnemies();
  updateDayNight();
  updateCamera();
  renderer.render(scene,camera);
}
animate();

// RESPONSIVE
window.addEventListener("resize",()=>{
  camera.aspect=window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth,window.innerHeight);
});
