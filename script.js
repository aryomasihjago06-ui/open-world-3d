const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 3000);
const renderer = new THREE.WebGLRenderer({ antialias:true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ===== LIGHT =====
const sun = new THREE.DirectionalLight(0xffffff,1);
sun.position.set(100,200,100);
scene.add(sun);
scene.add(new THREE.AmbientLight(0xffffff,0.4));

// ===== WORLD SYSTEM =====
let time=0;
function updateWorld(){
  time+=0.002;
  const intensity=Math.sin(time)*0.5+0.5;
  sun.intensity=intensity;
  scene.background=new THREE.Color().setHSL(0.6,0.5,intensity);
}

// ===== GROUND =====
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(1500,1500),
  new THREE.MeshStandardMaterial({color:0x3cb043})
);
ground.rotation.x=-Math.PI/2;
scene.add(ground);

// ===== WATER =====
const water = new THREE.Mesh(
  new THREE.PlaneGeometry(200,200),
  new THREE.MeshStandardMaterial({color:0x1e90ff})
);
water.rotation.x=-Math.PI/2;
water.position.set(200,0.1,200);
scene.add(water);

// ===== PLAYER =====
const player=new THREE.Group();
const body=new THREE.Mesh(
  new THREE.BoxGeometry(1.2,1.8,0.6),
  new THREE.MeshStandardMaterial({color:0x2196f3})
);
body.position.y=1;
player.add(body);
scene.add(player);

let health=100;
let coins=parseInt(localStorage.getItem("coins"))||0;
let exp=0;
let level=1;
let inventory=[];
let bullets=[];
let zombies=[];
let trees=[];

// ===== UI =====
const ui=document.createElement("div");
ui.style.position="fixed";
ui.style.top="10px";
ui.style.left="10px";
ui.style.color="white";
ui.style.fontSize="16px";
document.body.appendChild(ui);

function updateUI(){
  ui.innerHTML=`
  ❤️ ${Math.floor(health)}<br>
  💰 ${coins}<br>
  ⭐ LV ${level}<br>
  🎒 ${inventory.join(",")}
  `;
}

// ===== TREES =====
for(let i=0;i<15;i++){
  const t=new THREE.Mesh(
    new THREE.BoxGeometry(3,5,3),
    new THREE.MeshStandardMaterial({color:0x228B22})
  );
  t.position.set((Math.random()-0.5)*300,2.5,(Math.random()-0.5)*300);
  scene.add(t);
  trees.push(t);
}

// ===== HOUSE =====
const house=new THREE.Mesh(
  new THREE.BoxGeometry(10,6,10),
  new THREE.MeshStandardMaterial({color:0xaaaaaa})
);
house.position.set(-50,3,-50);
scene.add(house);

// ===== SPAWN ZOMBIE =====
function spawnZombie(){
  const z=new THREE.Mesh(
    new THREE.BoxGeometry(1,2,1),
    new THREE.MeshStandardMaterial({color:0x00ff00})
  );
  z.position.set((Math.random()-0.5)*200,1,(Math.random()-0.5)*200);
  scene.add(z);
  zombies.push(z);
}
setInterval(spawnZombie,6000);

// ===== MOBILE CONTROL =====
let moveX=0, moveZ=0;
const joystick=document.createElement("div");
joystick.style.position="fixed";
joystick.style.bottom="80px";
joystick.style.left="50px";
joystick.style.width="120px";
joystick.style.height="120px";
joystick.style.background="rgba(0,0,0,0.3)";
joystick.style.borderRadius="50%";
document.body.appendChild(joystick);

joystick.addEventListener("touchmove",(e)=>{
  const t=e.touches[0];
  const r=joystick.getBoundingClientRect();
  moveX=(t.clientX-(r.left+60))/40;
  moveZ=(t.clientY-(r.top+60))/40;
});
joystick.addEventListener("touchend",()=>{moveX=0; moveZ=0;});

// ===== BUTTONS =====
function createBtn(txt,right,bottom,action){
  const b=document.createElement("button");
  b.innerHTML=txt;
  b.style.position="fixed";
  b.style.right=right;
  b.style.bottom=bottom;
  document.body.appendChild(b);
  b.onclick=action;
}

createBtn("⚔️","40px","40px",()=>{
  zombies.forEach((z,i)=>{
    if(player.position.distanceTo(z.position)<5){
      scene.remove(z);
      zombies.splice(i,1);
      coins+=5;
      exp+=5;
    }
  });
  trees.forEach((t,i)=>{
    if(player.position.distanceTo(t.position)<5){
      scene.remove(t);
      trees.splice(i,1);
      inventory.push("Wood");
    }
  });
});

createBtn("🔫","100px","40px",()=>{
  const bullet=new THREE.Mesh(
    new THREE.SphereGeometry(0.2),
    new THREE.MeshBasicMaterial({color:0xffff00})
  );
  bullet.position.copy(player.position);
  bullets.push(bullet);
  scene.add(bullet);
});

createBtn("🧱","160px","40px",()=>{
  const block=new THREE.Mesh(
    new THREE.BoxGeometry(2,2,2),
    new THREE.MeshStandardMaterial({color:0x8B4513})
  );
  block.position.set(player.position.x,1,player.position.z-5);
  scene.add(block);
});

createBtn("🛒","10px","150px",()=>{
  if(coins>=20){
    coins-=20;
    health=100;
  }
});

// ===== RAIN =====
const rain=[];
for(let i=0;i<100;i++){
  const drop=new THREE.Mesh(
    new THREE.BoxGeometry(0.05,0.5,0.05),
    new THREE.MeshBasicMaterial({color:0xaaaaaa})
  );
  drop.position.set((Math.random()-0.5)*300,Math.random()*50,(Math.random()-0.5)*300);
  scene.add(drop);
  rain.push(drop);
}

// ===== MUSIC =====
const bgMusic=new Audio("https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8a3cbe22a.mp3?filename=adventure-112191.mp3");
bgMusic.loop=true;
document.body.addEventListener("click",()=>{bgMusic.play();});

// ===== GAME LOOP =====
function animate(){
  requestAnimationFrame(animate);

  player.position.x+=moveX*0.1;
  player.position.z+=moveZ*0.1;

  bullets.forEach((b,bi)=>{
    b.position.z-=0.5;
    zombies.forEach((z,zi)=>{
      if(b.position.distanceTo(z.position)<1){
        scene.remove(z);
        scene.remove(b);
        zombies.splice(zi,1);
        bullets.splice(bi,1);
        coins+=10;
        exp+=10;
      }
    });
  });

  zombies.forEach(z=>{
    const dir=new THREE.Vector3().subVectors(player.position,z.position).normalize();
    z.position.add(dir.multiplyScalar(0.03));
    if(player.position.distanceTo(z.position)<2){
      health-=0.2;
    }
  });

  rain.forEach(d=>{
    d.position.y-=0.5;
    if(d.position.y<0) d.position.y=50;
  });

  if(exp>=50){
    level++;
    exp=0;
    alert("LEVEL UP!");
  }

  if(health<=0){
    alert("GAME OVER");
    location.reload();
  }

  localStorage.setItem("coins",coins);

  updateWorld();
  updateUI();
  camera.position.set(player.position.x,5,player.position.z+10);
  camera.lookAt(player.position);

  renderer.render(scene,camera);
}
animate();
