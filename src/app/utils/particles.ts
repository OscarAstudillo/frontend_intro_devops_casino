import * as THREE from 'three';

export function spawnVictoryParticles(): void {
  const canvas = document.createElement('canvas');
  canvas.style.cssText =
    'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:200';
  document.body.appendChild(canvas);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    60, window.innerWidth / window.innerHeight, 0.1, 100
  );
  camera.position.z = 15;

  const suits = ['♠', '♥', '♦', '♣', '★'];
  const particles: {
    mesh: THREE.Mesh;
    vx: number; vy: number;
    rx: number; ry: number;
  }[] = [];

  for (let i = 0; i < 40; i++) {
    const c2d = document.createElement('canvas');
    c2d.width = 64; c2d.height = 64;
    const ctx = c2d.getContext('2d')!;
    ctx.fillStyle = Math.random() > 0.5 ? '#d4af37' : '#10b981';
    ctx.font = 'bold 36px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(suits[i % suits.length], 32, 32);

    const tex = new THREE.CanvasTexture(c2d);
    const mat = new THREE.MeshBasicMaterial({
      map: tex, transparent: true, side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.8), mat);

    const angle = Math.random() * Math.PI * 2;
    const speed = 0.08 + Math.random() * 0.12;
    particles.push({
      mesh,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed + 0.04,
      rx: (Math.random() - 0.5) * 0.05,
      ry: (Math.random() - 0.5) * 0.05,
    });
    scene.add(mesh);
  }

  const startTime = performance.now();
  const duration = 1500;
  let frame: number;

  function animate() {
    const elapsed = performance.now() - startTime;
    if (elapsed > duration) {
      cancelAnimationFrame(frame);
      renderer.dispose();
      document.body.removeChild(canvas);
      return;
    }
    frame = requestAnimationFrame(animate);
    const progress = elapsed / duration;

    for (const p of particles) {
      p.mesh.position.x += p.vx;
      p.mesh.position.y += p.vy;
      p.vy -= 0.003;
      p.mesh.rotation.x += p.rx;
      p.mesh.rotation.y += p.ry;
      (p.mesh.material as THREE.MeshBasicMaterial).opacity =
        1 - Math.max(0, (progress - 0.6) / 0.4);
    }

    renderer.render(scene, camera);
  }
  animate();
}
