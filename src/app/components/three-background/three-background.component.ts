import {
  Component, OnInit, OnDestroy, ElementRef, ViewChild, NgZone
} from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-three-background',
  standalone: true,
  template: `
    <canvas #canvas style="position:fixed;top:0;left:0;width:100%;height:100%;
      z-index:-1;pointer-events:none;display:block"></canvas>
  `,
})
export class ThreeBackgroundComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private cards: THREE.Mesh[] = [];
  private frameId!: number;
  private mouseX = 0;
  private mouseY = 0;

  private boundMouseMove = this.onMouseMove.bind(this);
  private boundResize    = this.onResize.bind(this);

  constructor(private ngZone: NgZone) {}

  ngOnInit(): void {
    this.ngZone.runOutsideAngular(() => this.init());
  }

  private init(): void {
    const canvas = this.canvasRef.nativeElement;

    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: false, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x040d1c, 1);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.scene  = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      60, window.innerWidth / window.innerHeight, 0.1, 100
    );
    this.camera.position.z = 20;

    const suits = ['♠', '♥', '♦', '♣'];
    for (let i = 0; i < 30; i++) {
      const c2d = document.createElement('canvas');
      c2d.width = 64; c2d.height = 64;
      const ctx = c2d.getContext('2d')!;
      const suit = suits[i % 4];
      const isGold = suit === '♥' || suit === '♦';
      ctx.fillStyle = isGold
        ? 'rgba(212,175,55,0.6)'
        : 'rgba(16,185,129,0.6)';
      ctx.font = 'bold 40px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(suit, 32, 32);

      const tex = new THREE.CanvasTexture(c2d);
      const mat = new THREE.MeshBasicMaterial({
        map: tex, transparent: true, side: THREE.DoubleSide
      });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.2), mat);
      mesh.position.set(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 10
      );
      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      (mesh as any)['vel'] = {
        y:  0.008 + Math.random() * 0.006,
        rx: (Math.random() - 0.5) * 0.004,
        ry: (Math.random() - 0.5) * 0.004,
      };
      this.cards.push(mesh);
      this.scene.add(mesh);
    }

    window.addEventListener('mousemove', this.boundMouseMove);
    window.addEventListener('resize',    this.boundResize);
    this.loop();
  }

  private loop(): void {
    this.frameId = requestAnimationFrame(() => this.loop());

    this.camera.rotation.x +=
      (-this.mouseY * 0.04 - this.camera.rotation.x) * 0.02;
    this.camera.rotation.y +=
      ( this.mouseX * 0.04 - this.camera.rotation.y) * 0.02;

    for (const card of this.cards) {
      const v = (card as any)['vel'];
      card.position.y  += v.y;
      card.rotation.x  += v.rx;
      card.rotation.y  += v.ry;
      if (card.position.y > 18) {
        card.position.y  = -18;
        card.position.x  = (Math.random() - 0.5) * 40;
      }
    }

    this.renderer.render(this.scene, this.camera);
  }

  private onMouseMove(e: MouseEvent): void {
    this.mouseX =  (e.clientX / window.innerWidth  - 0.5) * 2;
    this.mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
  }

  private onResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.frameId);
    window.removeEventListener('mousemove', this.boundMouseMove);
    window.removeEventListener('resize',    this.boundResize);
    this.renderer.dispose();
  }
}
