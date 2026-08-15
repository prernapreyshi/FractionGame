const PARTICLE_COUNT = 36;
const BURST_DURATION_MS = 1100;
const COLORS = [0xe8a33d, 0xc1447e, 0x4e9f7d, 0xf3c969, 0x7bb8a0];

export class ThreeCelebration {
  /** @param {HTMLElement} containerEl */
  constructor(containerEl) {
    this.container = containerEl;
    this._active = false;
  }
 
  get isAvailable() {
    return typeof window.THREE !== 'undefined';
  }

  
  burst() {
    if (!this.isAvailable || this._active) return;
    this._active = true;

    const THREE = window.THREE;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 6.5);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.pointerEvents = 'none';
    this.container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const light = new THREE.DirectionalLight(0xffffff, 0.8);
    light.position.set(2, 3, 4);
    scene.add(light);

    const geometry = new THREE.IcosahedronGeometry(0.16, 0);
    const particles = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const material = new THREE.MeshStandardMaterial({
        color: COLORS[i % COLORS.length],
        transparent: true,
        opacity: 1
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(0, 0, 0);

      
      const angle = Math.random() * Math.PI * 2;
      const spread = 1.5 + Math.random() * 2.5;
      mesh.userData.velocity = new THREE.Vector3(
        Math.cos(angle) * spread,
        Math.random() * 3 + 1.5,
        (Math.random() - 0.5) * 2
      );
      mesh.userData.spin = new THREE.Vector3(
        Math.random() * 4,
        Math.random() * 4,
        Math.random() * 4
      );

      scene.add(mesh);
      particles.push(mesh);
    }

    const startTime = performance.now();
    const gravity = -4.5;

    const animate = (now) => {
      const elapsed = now - startTime;
      const t = elapsed / 1000; // seconds

      particles.forEach((mesh) => {
        const v = mesh.userData.velocity;
        v.y += gravity * (1 / 60);
        mesh.position.x += v.x * (1 / 60);
        mesh.position.y += v.y * (1 / 60);
        mesh.position.z += v.z * (1 / 60);

        const s = mesh.userData.spin;
        mesh.rotation.x += s.x * 0.02;
        mesh.rotation.y += s.y * 0.02;

        mesh.material.opacity = Math.max(0, 1 - elapsed / BURST_DURATION_MS);
      });

      renderer.render(scene, camera);

      if (elapsed < BURST_DURATION_MS) {
        requestAnimationFrame(animate);
      } else {
        this._cleanup(renderer, geometry, particles);
      }
    };

    requestAnimationFrame(animate);
  }


  _cleanup(renderer, geometry, particles) {
    particles.forEach((mesh) => mesh.material.dispose());
    geometry.dispose();
    renderer.domElement.remove();
    renderer.dispose();
    this._active = false;
  }
}
