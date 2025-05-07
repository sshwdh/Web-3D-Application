let scene, camera, renderer, controls, mixer, clock;
let model, isWireframe = false, isPlaying = false;
let originalTextures = []; // 保存原始贴图

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf9f9f9);

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 1.5, 3);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("threeCanvas"),
    antialias: true,
  });
  resizeRenderer();

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.update();

  // 灯光增强
  scene.add(new THREE.AmbientLight(0xffffff, 0.8));
  const mainLight = new THREE.DirectionalLight(0xffffff, 1);
  mainLight.position.set(5, 5, 5);
  scene.add(mainLight);
  const sideLight = new THREE.DirectionalLight(0xffffff, 0.6);
  sideLight.position.set(-5, 3, 2);
  scene.add(sideLight);
  const backLight = new THREE.DirectionalLight(0xffffff, 0.4);
  backLight.position.set(0, 5, -5);
  scene.add(backLight);

  const loader = new THREE.GLTFLoader();
  loader.load("../models/lianpu.glb", (gltf) => {
    model = gltf.scene;

    model.scale.set(3, 3, 3);
    const box = new THREE.Box3().setFromObject(model);
    const center = new THREE.Vector3();
    box.getCenter(center);
    model.position.sub(center);

    // 保存原贴图
    model.traverse((child) => {
      if (child.isMesh && child.material && child.material.map) {
        originalTextures.push({ mesh: child, texture: child.material.map });
      }
    });

    scene.add(model);

    if (gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(model);
      mixer.clipAction(gltf.animations[0]).play();
      mixer.timeScale = 0;
    }
  });

  clock = new THREE.Clock();
  window.addEventListener("resize", onWindowResize);
}

function resizeRenderer() {
  const canvas = renderer.domElement;
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.setPixelRatio(window.devicePixelRatio);
}

function onWindowResize() {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  if (mixer && isPlaying) mixer.update(delta);
  controls.update();
  renderer.render(scene, camera);
}

// 切换线框
function toggleWireframe() {
  if (!model) return;
  model.traverse((child) => {
    if (child.isMesh) {
      child.material.wireframe = !child.material.wireframe;
    }
  });
  isWireframe = !isWireframe;
}

// 播放动画
function toggleAnimation() {
  isPlaying = !isPlaying;
  if (mixer) mixer.timeScale = isPlaying ? 1 : 0;
}

// 切换贴图
const textureLoader = new THREE.TextureLoader();

function applyTexture() {
  if (!model) return;
  textureLoader.load("../images/unnamed.jpg", (texture) => {
    texture.flipY = false;
    model.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.map = texture;
        child.material.needsUpdate = true;
      }
    });
  });
}

// 恢复默认贴图
function resetTexture() {
  if (!model || originalTextures.length === 0) return;
  originalTextures.forEach(({ mesh, texture }) => {
    mesh.material.map = texture;
    mesh.material.needsUpdate = true;
  });
}
