let scene, camera, renderer, controls, mixer, clock;
let model, pivot, isWireframe = false, isPlaying = false, isAutoRotate = false;

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf9f9f9);

  // 摄像机
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 1.5, 3);
  camera.lookAt(0, 0, 0);

  // 渲染器
  renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("threeCanvas"),
    antialias: true,
  });
  resizeRenderer();

  // 控制器
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.update();

  // 灯光
  scene.add(new THREE.AmbientLight(0xffffff, 0.8));
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 10, 7.5);
  scene.add(light);

  // 创建 pivot 用于旋转
  pivot = new THREE.Group();
  scene.add(pivot);

  // 加载模型
  const loader = new THREE.GLTFLoader();
  loader.load("../models/xiangqi.glb", (gltf) => {
    model = gltf.scene;

    model.scale.set(3, 3, 3);

    // 模型居中
    const box = new THREE.Box3().setFromObject(model);
    const center = new THREE.Vector3();
    box.getCenter(center);
    model.position.sub(center);

    // 添加到 pivot 中，实现原地旋转
    pivot.add(model);

    // 添加动画控制（可选）
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
  if (pivot && isAutoRotate) pivot.rotation.y += 0.01;

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




// 播放/暂停动画
function toggleAnimation() {
  isPlaying = !isPlaying;
  if (mixer) mixer.timeScale = isPlaying ? 1 : 0;
}

// 开启/停止自动旋转
function toggleRotation() {
  isAutoRotate = !isAutoRotate;
}
