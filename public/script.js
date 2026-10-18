
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";


// LUNAR ANALYTICS — 3D MOON ENGINE


const container = document.getElementById("globe");

if (!container) {
  throw new Error('Missing element with id="globe".');
}


// 1. SCENE, CAMERA, AND RENDERER


const scene = new THREE.Scene();
scene.background = new THREE.Color(0x02040a);

const camera = new THREE.PerspectiveCamera(
  42,
  container.clientWidth / container.clientHeight,
  0.1,
  500
);

camera.position.set(0, 0, 3.2);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: false,
  powerPreference: "high-performance"
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

container.replaceChildren(renderer.domElement);


// 2. INTERACTIVE CAMERA CONTROLS


const controls = new OrbitControls(camera, renderer.domElement);

controls.enableDamping = true;
controls.dampingFactor = 0.055;

controls.enablePan = false;
controls.enableRotate = true;
controls.enableZoom = true;

controls.minDistance = 1.25;
controls.maxDistance = 9;

controls.rotateSpeed = 0.65;
controls.zoomSpeed = 0.8;

controls.target.set(0, 0, 0);


// 3. STARFIELD


const starCount = 5000;
const starPositions = new Float32Array(starCount * 3);
const starColors = new Float32Array(starCount * 3);

for (let i = 0; i < starCount; i++) {
  // Distribute stars randomly across a large sphere.
  const z = Math.random() * 2 - 1;
  const angle = Math.random() * Math.PI * 2;
  const radius = 75 + Math.random() * 20;
  const ring = Math.sqrt(1 - z * z);

  starPositions[i * 3] =
    radius * ring * Math.cos(angle);

  starPositions[i * 3 + 1] =
    radius * z;

  starPositions[i * 3 + 2] =
    radius * ring * Math.sin(angle);

  const brightness = 0.55 + Math.random() * 0.45;

  starColors[i * 3] = brightness * 0.85;
  starColors[i * 3 + 1] = brightness * 0.9;
  starColors[i * 3 + 2] = brightness;
}

const starGeometry = new THREE.BufferGeometry();

starGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(starPositions, 3)
);

starGeometry.setAttribute(
  "color",
  new THREE.BufferAttribute(starColors, 3)
);

const starMaterial = new THREE.PointsMaterial({
  size: 0.12,
  vertexColors: true,
  sizeAttenuation: true,
  transparent: true,
  opacity: 0.95,
  depthWrite: false
});

const starfield = new THREE.Points(starGeometry, starMaterial);
scene.add(starfield);


// 4. MOON GEOMETRY


// High-resolution sphere.
// The texture provides the visible craters and maria.

const moonRadius = 1;

const moonGeometry = new THREE.SphereGeometry(
  moonRadius,
  192,
  192
);

const moonMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  roughness: 1.0,
  metalness: 0.0
});

const moon = new THREE.Mesh(moonGeometry, moonMaterial);
scene.add(moon);


// 5. LOAD LUNAR SURFACE TEXTURES


const textureLoader = new THREE.TextureLoader();
textureLoader.setCrossOrigin("anonymous");

const statusElement = document.querySelector(".scale-note");

function setStatus(message) {
  if (statusElement) {
    statusElement.textContent = message;
  }
}

setStatus("LOADING LUNAR SURFACE DATA...");

const textureURL =
  "https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/moonmap1k.jpg";

const bumpURL =
  "https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/moonbump1k.jpg";

function loadTexture(url) {
  return new Promise((resolve, reject) => {
    textureLoader.load(url, resolve, undefined, reject);
  });
}

async function loadMoonTextures() {
  try {
    const [surfaceTexture, bumpTexture] = await Promise.all([
      loadTexture(textureURL),
      loadTexture(bumpURL)
    ]);

    surfaceTexture.colorSpace = THREE.SRGBColorSpace;

    moonMaterial.map = surfaceTexture;
    moonMaterial.bumpMap = bumpTexture;

    // Subtle surface relief from the bump map.
    moonMaterial.bumpScale = 0.025;

    moonMaterial.needsUpdate = true;

    setStatus("LUNAR SURFACE LOADED · INTERACTIVE 3D MODEL");
  } catch (error) {
    console.error("Unable to load lunar textures:", error);

    // Keep the 3D sphere visible if the bump map fails.
    try {
      const surfaceTexture = await loadTexture(textureURL);

      surfaceTexture.colorSpace = THREE.SRGBColorSpace;
      moonMaterial.map = surfaceTexture;
      moonMaterial.needsUpdate = true;

      setStatus("LUNAR SURFACE LOADED · RELIEF UNAVAILABLE");
    } catch (surfaceError) {
      console.error("Lunar surface texture failed:", surfaceError);

      setStatus("TEXTURE UNAVAILABLE · CHECK CONNECTION");
    }
  }
}

loadMoonTextures();


// 6. LIGHTING


// Soft light on the shadowed side.
const ambientLight = new THREE.AmbientLight(
  0x8290b4,
  0.45
);

scene.add(ambientLight);

// Simulated sunlight from one direction.
const sunlight = new THREE.DirectionalLight(
  0xffffff,
  3.0
);

sunlight.position.set(-4, 2.5, 5);
scene.add(sunlight);


// 7. OPTIONAL ZOOM BUTTONS


const zoomIn = document.getElementById("zoomIn");
const zoomOut = document.getElementById("zoomOut");
const resetView = document.getElementById("resetView");

if (zoomIn) {
  zoomIn.addEventListener("click", () => {
    controls.dollyIn(1.25);
    controls.update();
  });
}

if (zoomOut) {
  zoomOut.addEventListener("click", () => {
    controls.dollyOut(1.25);
    controls.update();
  });
}

if (resetView) {
  resetView.addEventListener("click", () => {
    camera.position.set(0, 0, 3.2);
    controls.target.set(0, 0, 0);
    controls.update();
  });
}


// 8. RESPONSIVE RESIZING


function resize() {
  const width = container.clientWidth;
  const height = container.clientHeight;

  if (!width || !height) return;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
}

const resizeObserver = new ResizeObserver(resize);
resizeObserver.observe(container);


// 9. ANIMATION LOOP

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.05);

  // Very slow default rotation. Dragging still works.
  moon.rotation.y += delta * 0.025;

  controls.update();
  renderer.render(scene, camera);
}

animate();


// 10. CLEANUP IF THE PAGE IS REMOVED


window.addEventListener("pagehide", () => {
  resizeObserver.disconnect();
  controls.dispose();
  renderer.dispose();

  moonGeometry.dispose();
  moonMaterial.dispose();
  starGeometry.dispose();
  starMaterial.dispose();
});
