import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

// ─── Renderer ────────────────────────────────────────────────────────────────
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled   = true;
renderer.shadowMap.type      = THREE.PCFSoftShadowMap;
renderer.toneMapping         = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.outputColorSpace    = THREE.SRGBColorSpace;
document.getElementById('three-canvas')!.appendChild(renderer.domElement);

// ─── Scene / Camera ───────────────────────────────────────────────────────────
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.01, 10000);
camera.position.set(0, 0.5, 5);

// ─── Controls ────────────────────────────────────────────────────────────────
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping   = true;
controls.dampingFactor   = 0.05;
controls.minDistance     = 1.8;
controls.maxDistance     = 30;
controls.autoRotate      = true;
controls.autoRotateSpeed = 0.3;
controls.target.set(0, 0, 0);

// ─── Sky sphere ───────────────────────────────────────────────────────────────
const skyMat = new THREE.ShaderMaterial({
  uniforms: { uMap: { value: null }, uLoaded: { value: false } },
  vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
  fragmentShader: `
    uniform sampler2D uMap; uniform bool uLoaded; varying vec2 vUv;
    void main(){
      if(!uLoaded){ gl_FragColor=vec4(0.0,0.0,0.0,1.0); return; }
      vec3 c = texture2D(uMap,vUv).rgb;
      vec3 s = 1.0-(1.0-c)*(1.0-c*0.5);
      c = mix(c,s,0.4) * 0.15;
      float lum = dot(c,vec3(0.2126,0.7152,0.0722));
      c = mix(vec3(lum),c,0.9);
      gl_FragColor = vec4(clamp(c,0.0,1.0),1.0);
    }`,
  side: THREE.BackSide, depthWrite: false,
});
scene.add(new THREE.Mesh(new THREE.SphereGeometry(5000,64,32), skyMat));
new THREE.TextureLoader().load('/starmap_bg.jpg',(tex)=>{
  tex.colorSpace=THREE.SRGBColorSpace;
  skyMat.uniforms.uMap.value=tex;
  skyMat.uniforms.uLoaded.value=true;
});

// ─── Lighting — 21hrs.space style: harsh single sun, no fill ─────────────────
// Real lunar lighting: Sun is the only light source in space.
// No atmosphere = pure directional light, ink-black shadows.
const sun = new THREE.DirectionalLight(0xFFFAF0, 5.5); // slightly warm, like solar spectrum
sun.position.set(8, 3, 6); // from upper-right, creates visible terminator line
sun.castShadow=true;
sun.shadow.mapSize.set(4096,4096);
sun.shadow.camera.near=0.1; sun.shadow.camera.far=40;
sun.shadow.camera.left=sun.shadow.camera.bottom=-3;
sun.shadow.camera.right=sun.shadow.camera.top=3;
sun.shadow.bias=-0.0003;
scene.add(sun);
// Earthshine: faint cool fill from Earth's reflected light on the dark side
// Very subtle — 21hrs.space has near-black shadows
scene.add(new THREE.AmbientLight(0x050508, 0.04)); // almost zero ambient

// Real sun angles per Apollo site (degrees above horizon at landing time)
// From NASA mission documentation — used to update sun position dynamically
const SITE_SUN_ANGLES: Record<string, { az: number; el: number }> = {
  'Apollo 11': { az: 90,  el: 9  },  // 9° elevation, east
  'Apollo 12': { az: 95,  el: 8  },
  'Apollo 14': { az: 85,  el: 15 },
  'Apollo 15': { az: 100, el: 24 },
  'Apollo 16': { az: 88,  el: 11 },
  'Apollo 17': { az: 92,  el: 17 },
};

// Update sun position when a site is selected
function updateSunForSite(siteName: string) {
  const s = SITE_SUN_ANGLES[siteName];
  if (!s) return;
  // Convert azimuth+elevation to 3D direction
  const az = s.az * Math.PI / 180;
  const el = s.el * Math.PI / 180;
  sun.position.set(
    10 * Math.cos(el) * Math.sin(az),
    10 * Math.sin(el),
    10 * Math.cos(el) * Math.cos(az)
  );
  // Lower sun = longer shadows = higher drama
  const intensity = 4.5 + (s.el / 30) * 2.5; // 4.5 at horizon, 7 at high sun
  sun.intensity = intensity;
}
(window as any).updateSunForSite = updateSunForSite;

// ─── Star helpers ─────────────────────────────────────────────────────────────
function spherePt(pos:Float32Array,i:number,r:number){
  const t=Math.random()*Math.PI*2,p=Math.acos(2*Math.random()-1);
  pos[i*3]=r*Math.sin(p)*Math.cos(t); pos[i*3+1]=r*Math.sin(p)*Math.sin(t); pos[i*3+2]=r*Math.cos(p);
}

// ─── Layer 1: 30k micro stars (static 1px) ───────────────────────────────────
(()=>{
  const n=30000,pos=new Float32Array(n*3),col=new Float32Array(n*3);
  for(let i=0;i<n;i++){
    spherePt(pos,i,4900);
    const r=Math.random(),a=0.35+Math.random()*0.55;
    let cr,cg,cb;
    if(r<0.65){cr=1.0;cg=0.97;cb=0.88;}
    else if(r<0.80){cr=0.75;cg=0.88;cb=1.0;}
    else if(r<0.90){cr=1.0;cg=0.75;cb=0.45;}
    else if(r<0.97){cr=1.0;cg=0.55;cb=0.30;}
    else{cr=0.55;cg=0.70;cb=1.0;}
    col[i*3]=cr*a;col[i*3+1]=cg*a;col[i*3+2]=cb*a;
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  geo.setAttribute('starColor',new THREE.BufferAttribute(col,3));
  scene.add(new THREE.Points(geo,new THREE.ShaderMaterial({
    vertexShader:`attribute vec3 starColor;varying vec3 vC;void main(){vC=starColor;gl_PointSize=1.0;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader:`varying vec3 vC;void main(){gl_FragColor=vec4(vC,1.0);}`,
    transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
  })));
})();

// ─── Layer 2: 12k small twinkling stars ──────────────────────────────────────
const layer2=(()=>{
  const n=12000,pos=new Float32Array(n*3),col=new Float32Array(n*3),
        sz=new Float32Array(n),ph=new Float32Array(n),fq=new Float32Array(n);
  for(let i=0;i<n;i++){
    spherePt(pos,i,4900);
    const r=Math.random();
    if(r<0.65){col[i*3]=1.0;col[i*3+1]=0.97;col[i*3+2]=0.88;}
    else if(r<0.80){col[i*3]=0.75;col[i*3+1]=0.88;col[i*3+2]=1.0;}
    else if(r<0.90){col[i*3]=1.0;col[i*3+1]=0.75;col[i*3+2]=0.45;}
    else if(r<0.97){col[i*3]=1.0;col[i*3+1]=0.55;col[i*3+2]=0.30;}
    else{col[i*3]=0.55;col[i*3+1]=0.70;col[i*3+2]=1.0;}
    sz[i]=1.2+Math.random()*2.2; ph[i]=Math.random()*Math.PI*2; fq[i]=0.6+Math.random()*1.8;
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  geo.setAttribute('starColor',new THREE.BufferAttribute(col,3));
  geo.setAttribute('size',new THREE.BufferAttribute(sz,1));
  geo.setAttribute('phase',new THREE.BufferAttribute(ph,1));
  geo.setAttribute('freq',new THREE.BufferAttribute(fq,1));
  const mat=new THREE.ShaderMaterial({
    uniforms:{uTime:{value:0}},
    vertexShader:`attribute float size,phase,freq;attribute vec3 starColor;uniform float uTime;varying vec3 vC;void main(){vC=starColor;gl_PointSize=size*(1.0+0.12*sin(uTime*freq+phase));gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader:`varying vec3 vC;void main(){float d=length(gl_PointCoord-0.5);float a=smoothstep(0.5,0.1,d);if(a<0.01)discard;gl_FragColor=vec4(vC,a);}`,
    transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
  });
  const pts=new THREE.Points(geo,mat); scene.add(pts); return pts;
})();

// ─── Layer 3: 2k medium stars with halo ──────────────────────────────────────
const layer3=(()=>{
  const n=2000,pos=new Float32Array(n*3),col=new Float32Array(n*3),
        sz=new Float32Array(n),ph=new Float32Array(n);
  for(let i=0;i<n;i++){
    spherePt(pos,i,4900);
    const r=Math.random();
    if(r<0.40){col[i*3]=0.75;col[i*3+1]=0.88;col[i*3+2]=1.0;}
    else if(r<0.75){col[i*3]=1.0;col[i*3+1]=0.97;col[i*3+2]=0.88;}
    else if(r<0.90){col[i*3]=1.0;col[i*3+1]=0.75;col[i*3+2]=0.45;}
    else{col[i*3]=1.0;col[i*3+1]=0.55;col[i*3+2]=0.30;}
    sz[i]=3.0+Math.random()*6.0; ph[i]=Math.random()*Math.PI*2;
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  geo.setAttribute('starColor',new THREE.BufferAttribute(col,3));
  geo.setAttribute('size',new THREE.BufferAttribute(sz,1));
  geo.setAttribute('phase',new THREE.BufferAttribute(ph,1));
  const mat=new THREE.ShaderMaterial({
    uniforms:{uTime:{value:0}},
    vertexShader:`attribute float size,phase;attribute vec3 starColor;uniform float uTime;varying vec3 vC;varying float vP;void main(){vC=starColor;vP=phase;float sh=1.0+0.18*sin(uTime*(1.1+phase*1.3)+phase)+0.09*sin(uTime*(2.7+phase*0.9)+phase*2.0);gl_PointSize=size*sh;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader:`varying vec3 vC;varying float vP;uniform float uTime;void main(){float d=length(gl_PointCoord-0.5);float core=smoothstep(0.18,0.0,d);float halo=smoothstep(0.45,0.0,d)*0.25;float a=clamp((core+halo)*(1.0+0.15*sin(uTime*(1.9+vP*1.4)+vP*3.14)),0.0,1.0);if(a<0.01)discard;gl_FragColor=vec4(vC,a);}`,
    transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
  });
  const pts=new THREE.Points(geo,mat); scene.add(pts); return pts;
})();

// ─── Layer 4: 400 bright stars with diffraction spikes ───────────────────────
const layer4=(()=>{
  const n=400,pos=new Float32Array(n*3),sz=new Float32Array(n),
        ph=new Float32Array(n),col=new Float32Array(n*3);
  for(let i=0;i<n;i++){
    spherePt(pos,i,4900);
    sz[i]=5+Math.random()*12; ph[i]=Math.random()*Math.PI*2;
    const r=Math.random();
    if(r<0.35){col[i*3]=0.72;col[i*3+1]=0.85;col[i*3+2]=1.0;}
    else if(r<0.65){col[i*3]=1.0;col[i*3+1]=1.0;col[i*3+2]=0.95;}
    else if(r<0.85){col[i*3]=1.0;col[i*3+1]=0.94;col[i*3+2]=0.76;}
    else{col[i*3]=1.0;col[i*3+1]=0.82;col[i*3+2]=0.50;}
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  geo.setAttribute('size',new THREE.BufferAttribute(sz,1));
  geo.setAttribute('phase',new THREE.BufferAttribute(ph,1));
  geo.setAttribute('starColor',new THREE.BufferAttribute(col,3));
  const mat=new THREE.ShaderMaterial({
    uniforms:{uTime:{value:0}},
    vertexShader:`attribute float size,phase;attribute vec3 starColor;varying float vP;varying vec3 vC;uniform float uTime;void main(){vP=phase;vC=starColor;float f1=1.3+phase*0.5,f2=3.1+phase*1.7;gl_PointSize=size*(1.0+0.28*sin(uTime*f1+phase)+0.12*sin(uTime*f2+phase*2.0));gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader:`varying float vP;varying vec3 vC;uniform float uTime;void main(){vec2 uv=gl_PointCoord-0.5;float d=length(uv);float core=smoothstep(0.12,0.0,d);float halo=smoothstep(0.42,0.0,d)*0.15;float s1=smoothstep(0.035,0.0,abs(uv.x))*smoothstep(0.5,0.0,abs(uv.y));float s2=smoothstep(0.035,0.0,abs(uv.y))*smoothstep(0.5,0.0,abs(uv.x));vec2 r45=vec2(uv.x+uv.y,uv.x-uv.y)*0.7071;float s3=smoothstep(0.025,0.0,abs(r45.x))*smoothstep(0.5,0.0,abs(r45.y))*0.35;float s4=smoothstep(0.025,0.0,abs(r45.y))*smoothstep(0.5,0.0,abs(r45.x))*0.35;float sp=clamp(s1+s2+s3+s4,0.0,1.0);float sh=1.0+0.30*sin(uTime*(2.1+vP*2.3)+vP*6.28)+0.15*sin(uTime*(4.7+vP*1.1)+vP*3.14);float a=clamp((core+halo+sp*0.65)*sh,0.0,1.0);if(a<0.01)discard;float cs=0.5+0.5*sin(uTime*(1.8+vP)+vP*2.0);vec3 sc=mix(vC,mix(vC,vec3(0.9,0.95,1.0),0.3),cs*0.4);gl_FragColor=vec4(mix(mix(sc,vec3(0.8,0.9,1.0),0.35),sc,core/max(core+sp*0.5,0.001)),a);}`,
    transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
  });
  const pts=new THREE.Points(geo,mat); scene.add(pts); return pts;
})();

// ─── Zoom state ───────────────────────────────────────────────────────────────
let moonGroup: THREE.Group|null=null;
let isZoomed=false, isAnimating=false;
let currentAnimFrame: number|null=null;

// Zoom distance — matches 21hrs.space: close enough to see terrain, not touching surface
const ZOOM_IN_DIST  = 1.45; // units from Moon center (Moon radius = 1.0, so ~0.45 above surface)
const ZOOM_OUT_POS  = new THREE.Vector3(0, 0.5, 5);

function zoomTo(dir:THREE.Vector3, lm:{name:string,type:string,desc:string,lat:number,lon:number}|null){
  // If already animating, cancel current animation and start from current position
  if(currentAnimFrame !== null){
    cancelAnimationFrame(currentAnimFrame);
    currentAnimFrame = null;
  }
  isAnimating=true; isZoomed=true;
  controls.enabled=false; controls.autoRotate=false;
  const startPos=camera.position.clone();
  const targetPos=dir.clone().normalize().multiplyScalar(ZOOM_IN_DIST);
  // Smooth duration scales with distance so it always feels the same speed
  const dist = startPos.distanceTo(targetPos);
  const duration = Math.min(Math.max(dist * 300, 800), 1600); // 800-1600ms
  const t0=performance.now();
  function tick(){
    const elapsed = performance.now()-t0;
    const p=Math.min(elapsed/duration,1);
    // Smooth ease: quintic ease-in-out for cinematic feel
    const e=p<0.5?16*p*p*p*p*p:1-Math.pow(-2*p+2,5)/2;
    camera.position.lerpVectors(startPos,targetPos,e);
    camera.lookAt(0,0,0);
    if(p<1){
      currentAnimFrame=requestAnimationFrame(tick);
    } else {
      currentAnimFrame=null;
      isAnimating=false; controls.enabled=true;
      // Constrain orbit to a small area around the zoomed point
      // so user can look around but not fly around the whole Moon
      controls.minDistance=1.2; controls.maxDistance=1.8;
      // Lock polar angle to ±30° from current view direction
      const currentPolar = Math.acos(camera.position.clone().normalize().y);
      controls.minPolarAngle = Math.max(0.1, currentPolar - Math.PI/6);
      controls.maxPolarAngle = Math.min(Math.PI - 0.1, currentPolar + Math.PI/6);
      // Lock azimuth to ±30° from current
      const currentAzimuth = Math.atan2(camera.position.x, camera.position.z);
      controls.minAzimuthAngle = currentAzimuth - Math.PI/6;
      controls.maxAzimuthAngle = currentAzimuth + Math.PI/6;
      controls.update();
      window.dispatchEvent(new CustomEvent('moonclick', { detail: { name: lm?.name || 'Lunar Surface', lat: lm?.lat ?? 0, lon: lm?.lon ?? 0, type: (lm as any)?.type || 'Surface' } }));
      // Update sun angle to match real conditions at this site
      if (lm?.name) updateSunForSite(lm.name);
    }
  }
  currentAnimFrame=requestAnimationFrame(tick);
}
const LANDMARKS = [
  {name:'Apollo 11',   lat: 0.67, lon: 23.47, type:'Landing Site', desc:'First crewed lunar landing, July 20 1969, Sea of Tranquility.'},
  {name:'Apollo 12',   lat:-3.01, lon:-23.42, type:'Landing Site', desc:'Second crewed lunar landing, Nov 1969, Ocean of Storms.'},
  {name:'Apollo 14',   lat:-3.65, lon:-17.47, type:'Landing Site', desc:'Fra Mauro Highlands, Feb 1971. Alan Shepard and Edgar Mitchell.'},
  {name:'Apollo 15',   lat:26.13, lon:  3.63, type:'Landing Site', desc:'Hadley-Apennine, Jul 1971. First mission to use the lunar rover.'},
  {name:'Apollo 16',   lat:-8.97, lon: 15.50, type:'Landing Site', desc:'Descartes Highlands, Apr 1972. John Young and Charles Duke.'},
  {name:'Apollo 17',   lat:20.19, lon: 30.77, type:'Landing Site', desc:'Taurus-Littrow valley, Dec 1972. Last crewed Moon landing to date.'},
  {name:'Tycho',       lat:-43.31,lon:-11.22, type:'Crater',       desc:'Prominent ray crater 85 km wide, ~108 million years old.'},
  {name:'Copernicus',  lat:  9.62, lon:-20.08,type:'Crater',       desc:'93 km diameter impact crater, formed ~800 million years ago.'},
  {name:'Aristarchus', lat: 23.73, lon:-47.40,type:'Crater',       desc:'Brightest crater on the near side, highly reflective walls.'},
  {name:'Plato',       lat: 51.62, lon: -9.38,type:'Crater',       desc:'100 km walled plain with flat dark lava-flooded floor.'},
  {name:'Clavius',     lat:-58.40, lon:-14.36,type:'Crater',       desc:'One of the largest craters, 225 km across, southern highlands.'},
  {name:'Mare Tranquillitatis',lat:8.5,lon:31.4,type:'Mare',       desc:'Sea of Tranquility. Dark basaltic plain, Apollo 11 landing site.'},
  {name:'Mare Imbrium',lat:32.8,  lon:-15.6,  type:'Mare',         desc:'Sea of Showers. One of the largest impact basins, ~3.9 Ga.'},
  {name:'Oceanus Procellarum',lat:2.5,lon:-46.0,type:'Mare',       desc:'Ocean of Storms. Largest lunar mare, ~2.5 million km².'},
  {name:'Mare Serenitatis',lat:28.0,lon:17.5,  type:'Mare',        desc:'Sea of Serenity. Circular lava-flooded basin, near-side.'},
  {name:'Mare Crisium',lat:17.0,  lon: 59.1,  type:'Mare',         desc:'Sea of Crises. Isolated circular basin near the eastern limb.'},
  {name:'Montes Apenninus',lat:18.9,lon:3.7,  type:'Mountains',    desc:'600 km range forming the southeastern border of Mare Imbrium.'},
  {name:'Montes Alps',  lat:48.5, lon: 0.5,   type:'Mountains',    desc:'Lunar Alps bordering Mare Imbrium to the north.'},
];


function zoomOut(){
  if(!isZoomed)return;
  if(currentAnimFrame !== null){ cancelAnimationFrame(currentAnimFrame); currentAnimFrame=null; }
  isAnimating=true; isZoomed=false;
  // Release ALL constraints BEFORE animating � prevents OrbitControls fighting the animation
  controls.enabled=false;
  controls.minPolarAngle=0; controls.maxPolarAngle=Math.PI;
  controls.minAzimuthAngle=-Infinity; controls.maxAzimuthAngle=Infinity;
  controls.minDistance=0.01; controls.maxDistance=9999;
  window.dispatchEvent(new CustomEvent('moonexit'));
  const startPos=camera.position.clone();
  const duration=Math.min(Math.max(startPos.distanceTo(ZOOM_OUT_POS)*250,900),1500);
  const t0=performance.now();
  function tick(){
    const p=Math.min((performance.now()-t0)/duration,1);
    const e=p<0.5?16*p*p*p*p*p:1-Math.pow(-2*p+2,5)/2;
    camera.position.lerpVectors(startPos,ZOOM_OUT_POS,e);
    camera.lookAt(0,0,0);
    if(p<1){ currentAnimFrame=requestAnimationFrame(tick); }
    else{
      currentAnimFrame=null;
      camera.position.copy(ZOOM_OUT_POS);
      camera.lookAt(0,0,0);
      isAnimating=false;
      controls.enabled=true; controls.autoRotate=true;
      controls.minDistance=1.8; controls.maxDistance=30;
      controls.target.set(0,0,0); controls.update();
    }
  }
  currentAnimFrame=requestAnimationFrame(tick);
}

// ─── Public API ──────────────────────────────────────────────────────────────
(window as any).zoomToSite = (lat: number, lon: number, name: string) => {
  if (!moonGroup) return;
  if (isZoomed) window.dispatchEvent(new CustomEvent('moonexit'));
  const latR = lat * Math.PI / 180;
  const lonR = lon * Math.PI / 180;
  const dir = new THREE.Vector3(
    Math.cos(latR) * Math.sin(lonR),
    Math.sin(latR),
    Math.cos(latR) * Math.cos(lonR)
  );
  zoomTo(dir, { name, type: 'Landing Site', desc: '', lat, lon });
};

// Also expose zoomOut directly so React can call it
(window as any).zoomOut = () => zoomOut();

// Click to zoom — works even when already zoomed (seamless re-zoom to new point)
const raycaster=new THREE.Raycaster();
window.addEventListener('pointerdown',(e:PointerEvent)=>{
  if(e.button!==0||!moonGroup||isAnimating)return;
  const px=new THREE.Vector2((e.clientX/innerWidth)*2-1,-(e.clientY/innerHeight)*2+1);
  raycaster.setFromCamera(px,camera);
  const meshes:THREE.Mesh[]=[];
  moonGroup.traverse(c=>{if(c instanceof THREE.Mesh)meshes.push(c);});
  const hits=raycaster.intersectObjects(meshes,true);
  if(!hits.length)return;
  const hitPt=hits[0].point.clone();
  const dir=hitPt.normalize();
  // Find nearest landmark within 8°
  const COS8=Math.cos(8*Math.PI/180);
  let bestLm=null,bestDot=COS8;
  LANDMARKS.forEach(lm=>{
    const lat=lm.lat*Math.PI/180, lon=lm.lon*Math.PI/180;
    const d=new THREE.Vector3(Math.cos(lat)*Math.sin(lon),Math.sin(lat),Math.cos(lat)*Math.cos(lon));
    const dot=dir.dot(d);
    if(dot>bestDot){bestDot=dot;bestLm=lm;}
  });
  // Dismiss moonexit if re-zooming while zoomed
  if(isZoomed){
    window.dispatchEvent(new CustomEvent('moonexit'));
    isZoomed=false;
  }
  zoomTo(dir,bestLm);
});

window.addEventListener('dblclick',()=>{if(isZoomed&&!isAnimating)zoomOut();});

// ─── Moon GLB ────────────────────────────────────────────────────────────────
new GLTFLoader().load('/moon.glb',(gltf)=>{
  const moon=gltf.scene;
  const box=new THREE.Box3().setFromObject(moon);
  const center=box.getCenter(new THREE.Vector3());
  const size=box.getSize(new THREE.Vector3());
  const scale=2.0/Math.max(size.x,size.y,size.z);
  moon.scale.setScalar(scale);
  moon.position.set(-center.x*scale,-center.y*scale,-center.z*scale);

  // Keep GLB's own UV-mapped textures — DO NOT replace with equirectangular texture
  // Just boost normal map and roughness for more visible surface detail
  moon.traverse(child=>{
    if(!(child instanceof THREE.Mesh))return;
    child.castShadow=child.receiveShadow=true;
    const m=child.material as THREE.MeshStandardMaterial;
    if(m&&'roughness'in m){
      m.roughness=0.90;
      m.metalness=0.0;
      m.envMapIntensity=0.0;
      // Boost normal map for more pronounced crater depth/relief
      if(m.normalMap) m.normalScale.set(3.5, 3.5);
      if(m.bumpMap)   m.bumpScale = 0.12;
      m.needsUpdate=true;
    }
  });

  scene.add(moon);
  moonGroup=moon as THREE.Group;
  console.log('✅ Moon loaded');
},({loaded,total})=>console.log(`Moon: ${Math.round(loaded/total*100)}%`),
(err)=>console.error('❌ Moon:',err));

// ─── Post-processing ──────────────────────────────────────────────────────────
const composer=new EffectComposer(renderer);
composer.addPass(new RenderPass(scene,camera));
composer.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),0.7,1.2,0.60));
composer.addPass(new ShaderPass({
  uniforms:{tDiffuse:{value:null}},
  vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader:`uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec3 x=texture2D(tDiffuse,vUv).rgb;x=(x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14);x=clamp(x,0.0,1.0);vec2 uv=vUv-0.5;x*=1.0-dot(uv,uv)*0.9;gl_FragColor=vec4(x,1.0);}`,
}));

// ─── Resize ───────────────────────────────────────────────────────────────────
window.addEventListener('resize',()=>{
  camera.aspect=innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
  composer.setSize(innerWidth,innerHeight);
});

// ─── Animate ─────────────────────────────────────────────────────────────────
let t=0,last=performance.now();
function animate(){
  requestAnimationFrame(animate);
  const now=performance.now(); t+=(now-last)/1000; last=now;
  controls.update();
  (layer2.material as THREE.ShaderMaterial).uniforms.uTime.value=t;
  (layer3.material as THREE.ShaderMaterial).uniforms.uTime.value=t;
  (layer4.material as THREE.ShaderMaterial).uniforms.uTime.value=t;
  composer.render();
}
animate();
