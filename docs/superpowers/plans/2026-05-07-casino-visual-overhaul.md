# Casino Visual Overhaul — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rediseñar visualmente todo el casino frontend con identidad Monaco Royal (azul noche + esmeralda + dorado), GSAP para animaciones UI y Three.js para fondo WebGL y partículas de victoria.

**Architecture:** Un nuevo componente `ThreeBackgroundComponent` monta el canvas WebGL fijo detrás de toda la app. Una utilidad `particles.ts` encapsula las partículas de victoria Three.js reutilizadas por Slots y Blackjack. Cada componente importa GSAP directamente y limpia sus tweens en `ngOnDestroy`.

**Tech Stack:** Angular 17.3 standalone · GSAP 3 · Three.js · CSS 3D transforms · TypeScript 5.4

---

## Mapa de archivos

| Acción | Archivo |
|---|---|
| Modificar | `src/styles.css` |
| Crear | `src/app/components/three-background/three-background.component.ts` |
| Crear | `src/app/utils/particles.ts` |
| Modificar | `src/app/app.component.ts` |
| Modificar | `src/app/components/header/header.component.ts` |
| Modificar | `src/app/components/lobby/lobby.component.ts` |
| Modificar | `src/app/components/slots/slots.component.ts` |
| Modificar | `src/app/components/roulette/roulette.component.ts` |
| Modificar | `src/app/components/blackjack/blackjack.component.ts` |
| Modificar | `src/app/components/login/login.component.ts` |
| Modificar | `src/app/components/register/register.component.ts` |

---

## Task 1: Instalar dependencias

**Files:**
- Modify: `package.json` (via npm)

- [ ] **Step 1: Instalar paquetes**

```bash
cd /ruta/al/proyecto
npm install gsap three @types/three
```

- [ ] **Step 2: Verificar que el build compila**

```bash
ng build 2>&1 | tail -5
```

Resultado esperado: `Build at:` sin errores de TypeScript.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: instalar gsap, three y @types/three"
```

---

## Task 2: Sistema de diseño global — Monaco Royal

**Files:**
- Modify: `src/styles.css`

- [ ] **Step 1: Reemplazar styles.css completo**

```css
/* Monaco Royal — Design System */
:root {
  --bg:          #040d1c;
  --bg-card:     rgba(6,14,26,0.85);
  --emerald:     #10b981;
  --emerald-dk:  #065f46;
  --gold:        #d4af37;
  --gold-light:  #f0d060;
  --text:        #e0f0e8;
  --text-muted:  #4a7a64;
  --border:      rgba(16,185,129,0.1);
  --border-gold: rgba(212,175,55,0.3);
}

* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; height: 100%; }
body {
  font-family: 'Segoe UI', system-ui, sans-serif;
  background: linear-gradient(160deg, #040d1c 0%, #071524 55%, #040d1c 100%);
  color: var(--text);
  min-height: 100vh;
}
button { font-family: inherit; cursor: pointer; }
button:disabled { cursor: not-allowed; opacity: .5; }
a { color: var(--gold); text-decoration: none; }
a:hover { color: var(--gold-light); }

input, select {
  font-family: inherit;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid rgba(16,185,129,0.2);
  background: rgba(255,255,255,0.04);
  color: var(--text);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
input:focus, select:focus {
  border-color: var(--emerald);
  box-shadow: 0 0 0 3px rgba(16,185,129,0.15);
}

.btn {
  border: 0;
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: 600;
  letter-spacing: .5px;
  transition: transform .08s ease, filter .15s ease;
}
.btn-primario {
  background: linear-gradient(135deg, #0d7a56, #10b981);
  color: #fff;
  box-shadow: 0 4px 16px rgba(16,185,129,0.25);
}
.btn-primario:hover:not(:disabled) { filter: brightness(1.1); }
.btn-gold {
  background: linear-gradient(135deg, #b8902a, #d4af37);
  color: #050d1a;
  font-weight: 700;
}
.btn-secundario {
  background: rgba(255,255,255,0.05);
  color: var(--text);
  border: 1px solid rgba(255,255,255,0.1);
}
.btn-rojo  { background: linear-gradient(135deg, #7f1d1d, #b91c1c); color: #fff; }
.btn-verde { background: linear-gradient(135deg, #14532d, #16a34a); color: #fff; }
.btn:active:not(:disabled) { transform: translateY(1px); }

.tarjeta {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  backdrop-filter: blur(4px);
}

.titulo-juego {
  font-family: 'Georgia', serif;
  color: var(--gold);
  letter-spacing: 3px;
  text-transform: uppercase;
  margin: 0 0 20px;
  font-size: 20px;
  font-weight: 400;
}

.error { color: #fca5a5; margin-top: 8px; font-size: 13px; }
.exito { color: #86efac; margin-top: 8px; font-size: 13px; }

table { width: 100%; border-collapse: collapse; }
th, td { padding: 10px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.06); }
th { color: var(--gold); font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 2px; }
```

- [ ] **Step 2: Verificar build**

```bash
ng build 2>&1 | tail -5
```

Resultado esperado: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/styles.css
git commit -m "feat: sistema de diseño Monaco Royal en styles.css"
```

---

## Task 3: Fondo Three.js + transiciones de ruta

**Files:**
- Create: `src/app/components/three-background/three-background.component.ts`
- Create: `src/app/utils/particles.ts`
- Modify: `src/app/app.component.ts`

- [ ] **Step 1: Crear la utilidad de partículas de victoria**

Crear `src/app/utils/particles.ts`:

```typescript
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
```

- [ ] **Step 2: Crear ThreeBackgroundComponent**

Crear `src/app/components/three-background/three-background.component.ts`:

```typescript
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
```

- [ ] **Step 3: Actualizar AppComponent con Three.js + transiciones**

Reemplazar `src/app/app.component.ts`:

```typescript
import {
  Component, AfterViewInit, OnDestroy, ViewChild, ElementRef
} from '@angular/core';
import { Router, RouterOutlet, NavigationStart, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { gsap } from 'gsap';
import { HeaderComponent } from './components/header/header.component';
import { ThreeBackgroundComponent } from './components/three-background/three-background.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, ThreeBackgroundComponent],
  template: `
    <app-three-background></app-three-background>
    <app-header></app-header>
    <div class="contenido" #outlet>
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .contenido { max-width: 1100px; margin: 0 auto; padding: 24px; position: relative; }
  `]
})
export class AppComponent implements AfterViewInit, OnDestroy {
  @ViewChild('outlet') outletEl!: ElementRef<HTMLElement>;
  private sub!: Subscription;

  constructor(private router: Router) {}

  ngAfterViewInit(): void {
    this.sub = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        gsap.to(this.outletEl.nativeElement, {
          opacity: 0, y: -12, duration: 0.2, ease: 'power2.in'
        });
      }
      if (event instanceof NavigationEnd) {
        gsap.fromTo(
          this.outletEl.nativeElement,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
        );
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
```

- [ ] **Step 4: Verificar build**

```bash
ng build 2>&1 | tail -8
```

Resultado esperado: sin errores. Si aparece error de tipos de Three.js, verificar que `@types/three` está instalado.

- [ ] **Step 5: Verificar visual**

```bash
ng serve
```

Abrir `http://localhost:4200`. Verificar:
- Fondo azul noche con naipes flotando en 3D
- Los naipes responden al movimiento del mouse (parallax)
- La navegación entre rutas tiene fade-out/fade-in

- [ ] **Step 6: Commit**

```bash
git add src/app/components/three-background/ src/app/utils/ src/app/app.component.ts
git commit -m "feat: fondo Three.js con naipes 3D y transiciones de ruta GSAP"
```

---

## Task 4: Header — shimmer dorado y count-up de saldo

**Files:**
- Modify: `src/app/components/header/header.component.ts`

- [ ] **Step 1: Reemplazar header.component.ts completo**

```typescript
import {
  Component, computed, effect, ChangeDetectorRef, NgZone, OnDestroy, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { gsap } from 'gsap';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="barra">
      <a routerLink="/lobby" class="marca">♠ Casino DevOps ♦</a>

      <nav *ngIf="auth.autenticado()">
        <a routerLink="/lobby"     routerLinkActive="activo">Lobby</a>
        <a routerLink="/slots"     routerLinkActive="activo">Slots</a>
        <a routerLink="/roulette"  routerLinkActive="activo">Ruleta</a>
        <a routerLink="/blackjack" routerLinkActive="activo">Blackjack</a>
        <a routerLink="/history"   routerLinkActive="activo">Historial</a>
      </nav>

      <div class="acciones" *ngIf="auth.autenticado(); else anon">
        <a routerLink="/profile" class="saldo-pill" title="Mi perfil">
          <span class="dot"></span>
          <span class="user">{{ auth.usuario()?.username }}</span>
          <span class="ficha">$ {{ displaySaldo.val | number:'1.0-0' }}</span>
        </a>
        <button class="btn btn-secundario" (click)="salir()">Salir</button>
      </div>

      <ng-template #anon>
        <div class="acciones">
          <a routerLink="/login"    class="btn btn-secundario">Login</a>
          <a routerLink="/register" class="btn btn-primario">Registrarse</a>
        </div>
      </ng-template>
    </header>
  `,
  styles: [`
    .barra {
      display: flex; align-items: center; gap: 24px;
      padding: 0 32px; height: 58px;
      background: rgba(3,9,18,0.9);
      border-bottom: 1px solid rgba(16,185,129,0.12);
      position: sticky; top: 0; z-index: 100;
      backdrop-filter: blur(14px);
    }
    .marca {
      font-family: 'Georgia', serif;
      font-size: 17px; letter-spacing: 4px; text-transform: uppercase;
      background: linear-gradient(90deg, #b8902a, #f0d060, #d4af37, #f0d060, #b8902a);
      background-size: 300% 100%;
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: shimmer 2.5s linear infinite;
      text-decoration: none;
    }
    @keyframes shimmer {
      0%   { background-position: 100% 0; }
      100% { background-position: -100% 0; }
    }
    nav { display: flex; gap: 2px; flex: 1; }
    nav a {
      font-size: 12px; padding: 5px 13px; border-radius: 6px;
      color: #6a8a7a; letter-spacing: 0.3px;
      transition: color 0.2s;
    }
    nav a.activo {
      background: rgba(16,185,129,0.1);
      color: #10b981;
      border: 1px solid rgba(16,185,129,0.22);
    }
    .acciones { display: flex; gap: 12px; align-items: center; }
    .saldo-pill {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 5px 14px 5px 10px;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(212,175,55,0.28);
      border-radius: 999px;
      text-decoration: none;
    }
    .dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: #10b981; box-shadow: 0 0 7px #10b981;
      animation: dot-pulse 2.2s ease-in-out infinite;
      flex-shrink: 0;
    }
    @keyframes dot-pulse {
      0%,100% { transform: scale(1); opacity: 1; }
      50%      { transform: scale(1.5); opacity: 0.6; }
    }
    .user  { font-size: 12px; color: #9ab8b0; }
    .ficha { font-size: 13px; font-weight: 700; color: #d4af37; font-variant-numeric: tabular-nums; }
  `],
})
// Nota: usa ChangeDetection Default para compatibilidad con GSAP markForCheck()
export class HeaderComponent implements OnDestroy {
  readonly displaySaldo = { val: 0 };
  private tween?: gsap.core.Tween;

  constructor(public auth: AuthService, private router: Router) {
    const cdr = inject(ChangeDetectorRef);
    const ngZone = inject(NgZone);

    effect(() => {
      const saldo = Number(this.auth.usuario()?.saldo ?? 0);
      const prev  = this.displaySaldo.val;
      const dur   = Math.min(0.8, Math.max(0.3, Math.abs(saldo - prev) / 5000));

      this.tween?.kill();
      this.tween = ngZone.runOutsideAngular(() =>
        gsap.to(this.displaySaldo, {
          val: saldo, duration: dur, ease: 'power2.out',
          onUpdate: () => ngZone.run(() => cdr.markForCheck()),
        })
      );
    });
  }

  salir(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }

  ngOnDestroy(): void {
    this.tween?.kill();
  }
}
```

- [ ] **Step 2: Verificar build**

```bash
ng build 2>&1 | tail -5
```

- [ ] **Step 3: Verificar visual**

Iniciar sesión → verificar:
- Logo con shimmer dorado deslizante
- Punto verde pulsante junto al saldo
- Al ganar/perder en un juego, el saldo anima con count-up

- [ ] **Step 4: Commit**

```bash
git add src/app/components/header/header.component.ts
git commit -m "feat: header con shimmer dorado y count-up de saldo GSAP"
```

---

## Task 5: Lobby — stagger de entrada y hover 3D en cards

**Files:**
- Modify: `src/app/components/lobby/lobby.component.ts`

- [ ] **Step 1: Reemplazar lobby.component.ts completo**

```typescript
import {
  Component, OnInit, AfterViewInit, OnDestroy,
  ViewChild, ViewChildren, QueryList, ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { gsap } from 'gsap';
import { CasinoService } from '../../services/casino.service';
import { AuthService } from '../../services/auth.service';
import { Juego } from '../../models/casino.models';

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="hero" #hero>
      <p class="eyebrow">Bienvenido de regreso</p>
      <h1>Hola, <span class="nombre">{{ auth.usuario()?.username }}</span></h1>
      <div class="saldo-pill">
        <span class="saldo-label">Saldo</span>
        <span class="saldo-valor">$ {{ auth.usuario()?.saldo | number:'1.0-0' }}</span>
      </div>
      <p class="sub">Elige un juego para empezar.</p>
    </section>

    <div class="divisor">Juegos disponibles</div>

    <section class="grilla">
      <a #gameCard
         *ngFor="let j of juegos"
         [routerLink]="['/' + j.codigo]"
         class="juego-card"
         (mousemove)="onCardMove($event, gameCard)"
         (mouseleave)="onCardLeave(gameCard)">

        <div class="cd cd-tl"></div>
        <div class="cd cd-br"></div>

        <div class="banner">
          <!-- SLOTS -->
          <ng-container *ngIf="j.codigo === 'slots'">
            <div class="icon-slots">
              <div class="reel">7</div>
              <div class="reel">♦</div>
              <div class="reel">7</div>
            </div>
          </ng-container>
          <!-- ROULETTE -->
          <ng-container *ngIf="j.codigo === 'roulette'">
            <div class="icon-roulette">
              <div class="wheel-r">
                <div class="spoke s1"></div><div class="spoke s2"></div>
                <div class="spoke s3"></div><div class="spoke s4"></div>
                <div class="hub-r">0</div>
              </div>
            </div>
          </ng-container>
          <!-- BLACKJACK -->
          <ng-container *ngIf="j.codigo === 'blackjack'">
            <div class="icon-bj">
              <div class="card-bj black">A<span>♠</span></div>
              <div class="card-bj red">K<span>♥</span></div>
            </div>
          </ng-container>
          <span class="suit-tl">♠</span>
          <span class="suit-br">♠</span>
        </div>

        <div class="info">
          <h3>{{ j.nombre }}</h3>
          <p>{{ j.descripcion }}</p>
          <div class="rangos">
            <span>$ {{ j.apuesta_min }} – $ {{ j.apuesta_max }}</span>
            <span class="play">Jugar →</span>
          </div>
        </div>
      </a>
    </section>

    <p *ngIf="error" class="error">{{ error }}</p>
  `,
  styles: [`
    .hero { text-align: center; margin-bottom: 36px; }
    .eyebrow {
      font-size: 10px; letter-spacing: 5px; text-transform: uppercase;
      color: #10b981; margin-bottom: 14px; opacity: 0.75;
    }
    .hero h1 {
      font-family: 'Georgia', serif; font-size: 36px; font-weight: 400;
      color: #dce8e0; margin: 0 0 18px; letter-spacing: 1px;
    }
    .nombre {
      background: linear-gradient(135deg, #c9a227, #f0d060, #d4af37);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .saldo-pill {
      display: inline-flex; align-items: baseline; gap: 12px;
      padding: 10px 28px;
      background: rgba(16,185,129,0.05);
      border: 1px solid rgba(16,185,129,0.18); border-radius: 50px;
      margin-bottom: 14px;
    }
    .saldo-label { font-size: 11px; color: #3a6a54; letter-spacing: 2px; text-transform: uppercase; }
    .saldo-valor { font-size: 24px; font-weight: 700; color: #d4af37; font-variant-numeric: tabular-nums; }
    .sub { color: #4a7a64; font-size: 14px; margin: 0; }

    .divisor {
      font-size: 10px; letter-spacing: 4px; text-transform: uppercase;
      color: #3a6a54; margin-bottom: 18px; text-align: center;
      display: flex; align-items: center; gap: 12px;
    }
    .divisor::before, .divisor::after {
      content: ''; flex: 1; height: 1px;
      background: linear-gradient(90deg, transparent, rgba(16,185,129,0.18), transparent);
    }

    .grilla { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 18px; }

    .juego-card {
      display: block; text-decoration: none; color: inherit;
      background: rgba(6,14,26,0.85);
      border: 1px solid rgba(16,185,129,0.1);
      border-radius: 14px; overflow: hidden;
      position: relative;
      transform-style: preserve-3d;
      transition: border-color 0.3s, box-shadow 0.3s;
      will-change: transform;
    }
    .juego-card:hover {
      border-color: rgba(16,185,129,0.35);
      box-shadow: 0 24px 60px rgba(0,0,0,0.55), 0 0 28px rgba(16,185,129,0.08);
    }

    /* Corner decorations */
    .cd {
      position: absolute; width: 14px; height: 14px;
      border-color: rgba(212,175,55,0.2); border-style: solid;
      transition: border-color 0.3s; z-index: 3;
    }
    .juego-card:hover .cd { border-color: rgba(212,175,55,0.55); }
    .cd-tl { top: 7px; left: 7px; border-width: 1px 0 0 1px; }
    .cd-br { bottom: 7px; right: 7px; border-width: 0 1px 1px 0; }

    .banner {
      height: 130px; display: flex; align-items: center; justify-content: center;
      background: linear-gradient(160deg, #060f1e, #0c1a30);
      position: relative; overflow: hidden;
    }
    .suit-tl { position:absolute; top:10px; left:12px; font-family:Georgia,serif; font-size:13px; opacity:0.12; }
    .suit-br { position:absolute; bottom:10px; right:12px; font-family:Georgia,serif; font-size:13px; opacity:0.12; }

    /* Slots icon */
    .icon-slots { display: flex; gap: 6px; align-items: center; }
    .reel {
      width: 30px; height: 38px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(16,185,129,0.35); border-radius: 5px;
      display: flex; align-items: center; justify-content: center;
      font-family: Georgia, serif; font-size: 16px; color: #d4af37;
      box-shadow: 0 0 8px rgba(16,185,129,0.2);
    }

    /* Roulette icon */
    .icon-roulette { }
    .wheel-r {
      width: 72px; height: 72px; border-radius: 50%;
      border: 3px solid rgba(212,175,55,0.5);
      box-shadow: 0 0 16px rgba(212,175,55,0.2);
      position: relative; display: flex; align-items: center; justify-content: center;
      animation: wheel-spin 8s linear infinite;
    }
    @keyframes wheel-spin { to { transform: rotate(360deg); } }
    .spoke {
      position: absolute; width: 2px; height: 100%;
      background: rgba(212,175,55,0.2); top:0; left:50%; transform: translateX(-50%);
    }
    .s2 { transform: translateX(-50%) rotate(45deg); }
    .s3 { transform: translateX(-50%) rotate(90deg); }
    .s4 { transform: translateX(-50%) rotate(135deg); }
    .hub-r {
      width: 32px; height: 32px; border-radius: 50%;
      background: #07101e; border: 2px solid rgba(16,185,129,0.4);
      display: flex; align-items: center; justify-content: center;
      font-family: Georgia, serif; font-size: 14px; color: #10b981;
      animation: counter-spin 8s linear infinite;
    }
    @keyframes counter-spin { to { transform: rotate(-360deg); } }

    /* Blackjack icon */
    .icon-bj { display: flex; position: relative; }
    .card-bj {
      width: 44px; height: 60px; background: #fff; border-radius: 6px;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      font-family: Georgia, serif; font-size: 16px; font-weight: 700;
      box-shadow: 0 4px 14px rgba(0,0,0,0.5);
    }
    .card-bj span { font-size: 11px; }
    .card-bj.black { color: #1a1a1a; transform: rotate(-8deg) translateX(6px); }
    .card-bj.red   { color: #b91c1c; transform: rotate(4deg); }

    /* Info */
    .info { padding: 14px 16px 18px; }
    .info h3 {
      font-family: Georgia, serif; font-size: 16px;
      color: #d4af37; letter-spacing: 1px; margin: 0 0 5px;
    }
    .info p { font-size: 12px; color: #3a6a54; line-height: 1.55; margin: 0 0 12px; }
    .rangos { display: flex; justify-content: space-between; align-items: center; }
    .rangos span { font-size: 11px; color: #6a8a7a; }
    .play {
      font-size: 11px; padding: 4px 12px; border-radius: 20px;
      background: rgba(16,185,129,0.08);
      border: 1px solid rgba(16,185,129,0.25); color: #10b981;
    }
  `]
})
export class LobbyComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('hero')         heroEl!: ElementRef<HTMLElement>;
  @ViewChildren('gameCard')  cardEls!: QueryList<ElementRef<HTMLElement>>;

  juegos: Juego[] = [];
  error = '';
  private cardsSub?: import('rxjs').Subscription;

  constructor(public auth: AuthService, private casino: CasinoService) {}

  ngOnInit(): void {
    this.casino.miPerfil().subscribe();
    this.casino.listarJuegos().subscribe({
      next:  j  => (this.juegos = j),
      error: e  => (this.error = e.error?.error || 'No se pudo cargar el catálogo'),
    });
  }

  ngAfterViewInit(): void {
    gsap.from(this.heroEl.nativeElement, {
      opacity: 0, y: 30, duration: 0.6, ease: 'power2.out'
    });
    // Subscribe to QueryList changes — fires when *ngFor renders game cards after data loads
    this.cardsSub = this.cardEls.changes.subscribe(() => this.animateCards());
    if (this.cardEls.length) this.animateCards();
  }

  private animateCards(): void {
    gsap.from(this.cardEls.map(r => r.nativeElement), {
      opacity: 0, y: 20, duration: 0.5, ease: 'power2.out',
      stagger: 0.08, delay: 0.25,
    });
  }

  onCardMove(e: MouseEvent, card: HTMLElement): void {
    const rect = card.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;
    const rx   = ((e.clientY - cy) / (rect.height / 2)) * -6;
    const ry   = ((e.clientX - cx) / (rect.width  / 2)) *  6;
    gsap.to(card, {
      rotateX: rx, rotateY: ry,
      transformPerspective: 600,
      duration: 0.25, ease: 'power2.out',
    });
  }

  onCardLeave(card: HTMLElement): void {
    gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.4, ease: 'power2.out' });
  }

  ngOnDestroy(): void {
    this.cardsSub?.unsubscribe();
    gsap.killTweensOf(this.cardEls?.map(r => r.nativeElement) ?? []);
  }
}
```

- [ ] **Step 2: Verificar build**

```bash
ng build 2>&1 | tail -5
```

- [ ] **Step 3: Verificar visual**

Navegar al Lobby → verificar:
- Hero y cards entran con fade+slide en cascada
- Pasar el mouse sobre cada card la inclina en 3D
- Al salir el mouse, la card vuelve a plano

- [ ] **Step 4: Commit**

```bash
git add src/app/components/lobby/lobby.component.ts
git commit -m "feat: lobby con stagger GSAP y hover 3D en game cards"
```

---

## Task 6: Slots — rodillos GSAP con física elástica y partículas de victoria

**Files:**
- Modify: `src/app/components/slots/slots.component.ts`

- [ ] **Step 1: Reemplazar slots.component.ts completo**

```typescript
import { Component, OnDestroy, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { gsap } from 'gsap';
import { CasinoService } from '../../services/casino.service';
import { ResultadoSlots } from '../../models/casino.models';
import { spawnVictoryParticles } from '../../utils/particles';

const SIMBOLOS = ['7', 'BAR', '♦', '♣', '♠', '★'];
function aleatorio(): string { return SIMBOLOS[Math.floor(Math.random() * SIMBOLOS.length)]; }

@Component({
  selector: 'app-slots',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="tarjeta sl-cont">
      <h2 class="titulo-juego">♠ Tragamonedas</h2>

      <div class="rodillos-wrap">
        <div class="linea-pago"></div>
        <div class="rodillos">
          <div class="rodillo" #reel *ngFor="let s of rodillos; let i = index">
            <div class="strip" #strip>
              <span *ngFor="let sym of strips[i]" class="sym">{{ sym }}</span>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="resultado" class="resumen"
           [class.gano]="resultado.premio > 0"
           [class.perdio]="resultado.premio === 0">
        <ng-container *ngIf="resultado.premio > 0; else perdida">
          Ganaste $ {{ resultado.premio | number:'1.0-0' }}
          &nbsp;·&nbsp; {{ resultado.tipo }} × {{ resultado.multiplicador }}
        </ng-container>
        <ng-template #perdida>Sin suerte esta vez. Intenta de nuevo.</ng-template>
      </div>

      <div class="controles">
        <label>Apuesta
          <input type="number" [(ngModel)]="apuesta" min="10" max="500" step="10" />
        </label>
        <button class="btn btn-primario" (click)="girar()" [disabled]="girando">
          {{ girando ? 'Girando...' : 'Girar' }}
        </button>
      </div>

      <p class="hint">Apuesta entre $10 y $500 · Tres iguales paga hasta 50×</p>
      <p *ngIf="error" class="error">{{ error }}</p>
    </section>
  `,
  styles: [`
    .sl-cont { max-width: 560px; margin: 30px auto; text-align: center; }

    .rodillos-wrap { position: relative; margin: 24px 0; }
    .linea-pago {
      position: absolute; left: 0; right: 0; top: 50%;
      height: 2px; transform: translateY(-50%);
      background: rgba(16,185,129,0.5);
      box-shadow: 0 0 8px rgba(16,185,129,0.4);
      z-index: 2; pointer-events: none;
    }
    .rodillos { display: flex; justify-content: center; gap: 14px; }

    .rodillo {
      width: 110px; height: 140px;
      background: linear-gradient(180deg, rgba(4,13,28,0.95), rgba(6,18,36,0.95));
      border: 1px solid rgba(16,185,129,0.25); border-radius: 10px;
      overflow: hidden; position: relative;
      box-shadow: inset 0 0 20px rgba(0,0,0,0.5), 0 6px 20px rgba(0,0,0,0.4);
    }
    .rodillo::before {
      content: '';
      position: absolute; inset: 0; z-index: 3; pointer-events: none;
      background: linear-gradient(180deg,
        rgba(4,13,28,0.92) 0%, transparent 28%,
        transparent 72%, rgba(4,13,28,0.92) 100%);
    }

    .strip {
      display: flex; flex-direction: column;
      align-items: center;
      position: absolute; width: 100%; top: 0;
    }
    .strip.spinning {
      animation: strip-spin 0.5s linear infinite;
    }
    @keyframes strip-spin {
      0%   { transform: translateY(0); }
      100% { transform: translateY(-368px); }
    }
    .sym {
      height: 46px; width: 100%;
      display: flex; align-items: center; justify-content: center;
      font-family: Georgia, serif; font-size: 28px; color: #d4af37;
      font-weight: 700; flex-shrink: 0;
    }

    .controles { display: flex; justify-content: center; gap: 12px; align-items: flex-end; margin-top: 8px; }
    .controles label { display: flex; flex-direction: column; gap: 4px; font-size: 13px; color: #4a7a64; }
    .controles input { width: 110px; }
    .resumen { margin: 12px 0; font-size: 17px; font-weight: 600; }
    .resumen.gano   { color: #86efac; }
    .resumen.perdio { color: #fca5a5; }
    .hint { color: #4a7a64; font-size: 12px; margin-top: 8px; }
  `]
})
export class SlotsComponent implements OnDestroy {
  rodillos   = ['7', '♦', '♠'];
  strips     = [this.genStrip(), this.genStrip(), this.genStrip()];
  apuesta    = 50;
  girando    = false;
  resultado: ResultadoSlots | null = null;
  error      = '';

  @ViewChildren('strip') stripEls!: QueryList<ElementRef<HTMLElement>>;

  constructor(private casino: CasinoService) {}

  private genStrip(): string[] {
    return Array.from({ length: 8 }, () => aleatorio());
  }

  girar(): void {
    this.error     = '';
    this.resultado = null;
    this.girando   = true;
    this.strips    = [this.genStrip(), this.genStrip(), this.genStrip()];

    // CSS class drives the spinning animation; GSAP handles the stop
    this.stripEls.forEach(el =>
      el.nativeElement.classList.add('spinning')
    );

    this.casino.jugarSlots(this.apuesta).subscribe({
      next:  r => this.stopReels(r.resultado),
      error: e => {
        this.girando = false;
        this.stripEls.forEach(el => el.nativeElement.classList.remove('spinning'));
        this.error = e.error?.error || 'No se pudo jugar';
      }
    });
  }

  private stopReels(resultado: ResultadoSlots): void {
    const symbols = resultado.rodillos;

    this.stripEls.forEach((el, i) => {
      setTimeout(() => {
        el.nativeElement.classList.remove('spinning');

        // Rebuild strip so the winning symbol is at position index 3 (visible slot)
        const before = Array.from({ length: 3 }, () => aleatorio());
        const after  = Array.from({ length: 4 }, () => aleatorio());
        this.strips  = this.strips.map((s, idx) =>
          idx === i ? [...before, symbols[i], ...after] : s
        );

        // Snap to y=0 with elastic bounce
        gsap.fromTo(el.nativeElement,
          { y: -30 },
          {
            y: 0, duration: 0.55, ease: 'elastic.out(1, 0.45)',
            onComplete: () => { if (i === 2) this.onAllStopped(resultado); }
          }
        );
      }, i * 250 + 800);
    });
  }

  private onAllStopped(resultado: ResultadoSlots): void {
    this.rodillos  = resultado.rodillos;
    this.resultado = resultado;
    this.girando   = false;

    if (resultado.premio > 0) {
      // Flash overlay
      const overlay = document.createElement('div');
      overlay.style.cssText =
        'position:fixed;inset:0;background:rgba(16,185,129,0.12);z-index:150;pointer-events:none';
      document.body.appendChild(overlay);
      gsap.to(overlay, {
        opacity: 0, duration: 0.3, delay: 0.1,
        onComplete: () => document.body.removeChild(overlay)
      });

      setTimeout(() => spawnVictoryParticles(), 200);
    }
  }

  private stopAllTweens(): void {
    this.stripEls?.forEach(el => gsap.killTweensOf(el.nativeElement));
  }

  ngOnDestroy(): void {
    this.stopAllTweens();
  }
}
```

- [ ] **Step 2: Verificar build**

```bash
ng build 2>&1 | tail -5
```

- [ ] **Step 3: Verificar visual**

Navegar a Slots → verificar:
- Los rodillos giran fluidamente al hacer click en Girar
- Paran en secuencia (1→2→3) con efecto elástico
- Al ganar: flash esmeralda + partículas de naipes volando

- [ ] **Step 4: Commit**

```bash
git add src/app/components/slots/slots.component.ts
git commit -m "feat: slots con rodillos GSAP elastic.out y partículas Three.js al ganar"
```

---

## Task 7: Ruleta — rueda SVG de 37 números y giro GSAP

**Files:**
- Modify: `src/app/components/roulette/roulette.component.ts`

- [ ] **Step 1: Reemplazar roulette.component.ts completo**

```typescript
import {
  Component, AfterViewInit, OnDestroy,
  ViewChild, ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { gsap } from 'gsap';
import { CasinoService } from '../../services/casino.service';
import { ApuestaRuleta, ResultadoRuleta } from '../../models/casino.models';

const WHEEL_ORDER = [
  0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,
  10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26
];
const RED = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);

function segColor(n: number): string {
  if (n === 0) return '#14532d';
  return RED.has(n) ? '#7f1d1d' : '#111827';
}
function strokeColor(n: number): string {
  if (n === 0) return '#16a34a';
  return RED.has(n) ? '#b91c1c' : '#374151';
}
function textColor(n: number): string {
  if (n === 0) return '#86efac';
  return RED.has(n) ? '#fca5a5' : '#d1d5db';
}
function polar(cx: number, cy: number, r: number, a: number) {
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

@Component({
  selector: 'app-roulette',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="tarjeta r-cont">
      <h2 class="titulo-juego">♦ Ruleta</h2>

      <div class="layout">
        <!-- RUEDA -->
        <div class="panel-rueda">
          <div class="wheel-wrap">
            <div class="outer-deco"></div>
            <div class="pointer"></div>
            <svg #wheelSvg class="wheel-svg" viewBox="0 0 300 300"></svg>
            <div class="hub">
              <span class="hub-num">{{ resultado?.numero ?? '–' }}</span>
            </div>
          </div>

          <div class="historial">
            <span #histItem
              *ngFor="let h of historial"
              class="hist-num"
              [class.h-r]="isRojo(h)"
              [class.h-b]="!isRojo(h) && h !== 0"
              [class.h-g]="h === 0">
              {{ h }}
            </span>
          </div>
        </div>

        <!-- PANEL APUESTAS -->
        <div class="panel-apuestas">
          <div class="tabs">
            <button *ngFor="let t of tipos" class="tab"
                    [class.activa]="tipo === t.codigo"
                    (click)="tipo = t.codigo; valor = null">
              {{ t.nombre }}
            </button>
          </div>

          <!-- Número -->
          <div *ngIf="tipo === 'numero'" class="num-grid">
            <button class="num green"
                    [class.sel]="valor === 0"
                    (click)="valor = 0">0</button>
            <button *ngFor="let n of numeros"
                    class="num"
                    [class.red]="isRojo(n)"
                    [class.black]="!isRojo(n)"
                    [class.sel]="valor === n"
                    (click)="valor = n">{{ n }}</button>
          </div>

          <!-- Color -->
          <div *ngIf="tipo === 'color'" class="opts-flex">
            <button class="opt-c opt-rojo"  [class.sel]="valor === 'rojo'"  (click)="valor = 'rojo'">Rojo</button>
            <button class="opt-c opt-negro" [class.sel]="valor === 'negro'" (click)="valor = 'negro'">Negro</button>
          </div>

          <!-- Paridad -->
          <div *ngIf="tipo === 'paridad'" class="opts-flex">
            <button class="opt-c" [class.sel]="valor === 'par'"   (click)="valor = 'par'">Par</button>
            <button class="opt-c" [class.sel]="valor === 'impar'" (click)="valor = 'impar'">Impar</button>
          </div>

          <!-- Docena -->
          <div *ngIf="tipo === 'docena'" class="opts-flex">
            <button class="opt-c" [class.sel]="valor === 1" (click)="valor = 1">1ª Docena (1–12)</button>
            <button class="opt-c" [class.sel]="valor === 2" (click)="valor = 2">2ª Docena (13–24)</button>
            <button class="opt-c" [class.sel]="valor === 3" (click)="valor = 3">3ª Docena (25–36)</button>
          </div>

          <div class="monto-row">
            <label>Monto
              <input type="number" [(ngModel)]="monto" min="10" max="1000" step="10" />
            </label>
            <button class="btn btn-secundario" (click)="agregar()" [disabled]="!puedeAgregar()">
              + Agregar
            </button>
            <button class="btn btn-primario" (click)="girar()"
                    [disabled]="apuestas.length === 0 || girando">
              {{ girando ? 'Girando...' : 'Girar (' + totalApostado + ')' }}
            </button>
          </div>

          <div *ngIf="apuestas.length" class="lista">
            <p class="lista-titulo">Tablero de apuestas</p>
            <div *ngFor="let a of apuestas; let i = index" class="bet-row">
              <span>{{ describir(a) }}</span>
              <span class="bet-amt">$ {{ a.monto }}</span>
              <button class="btn btn-secundario" style="padding:3px 10px;font-size:11px"
                      (click)="apuestas.splice(i, 1)">×</button>
            </div>
          </div>

          <div *ngIf="resultado" class="detalle">
            <p class="lista-titulo">Resultado</p>
            <table>
              <tr *ngFor="let a of resultado.apuestas">
                <td>{{ describir(a) }}</td>
                <td>$ {{ a.monto }}</td>
                <td [class.gano]="a.gana" [class.perdio]="!a.gana">
                  {{ a.gana ? '+ $' + a.retorno : 'pierde' }}
                </td>
              </tr>
            </table>
          </div>

          <p *ngIf="error" class="error">{{ error }}</p>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .r-cont { max-width: 880px; margin: 20px auto; }
    .layout { display: grid; grid-template-columns: 280px 1fr; gap: 32px; }

    /* WHEEL */
    .panel-rueda { display: flex; flex-direction: column; align-items: center; gap: 16px; }
    .wheel-wrap  { position: relative; width: 260px; height: 260px; display: flex; align-items: center; justify-content: center; }
    .outer-deco  {
      position: absolute; inset: -8px; border-radius: 50%;
      border: 4px solid rgba(212,175,55,0.4);
      box-shadow: 0 0 30px rgba(212,175,55,0.15), inset 0 0 20px rgba(212,175,55,0.05);
      animation: deco-rot 40s linear infinite;
    }
    @keyframes deco-rot { to { transform: rotate(360deg); } }
    .pointer {
      position: absolute; top: -2px; left: 50%; transform: translateX(-50%);
      width: 0; height: 0;
      border-left: 8px solid transparent; border-right: 8px solid transparent;
      border-top: 20px solid #d4af37;
      filter: drop-shadow(0 0 8px rgba(212,175,55,0.7)); z-index: 10;
    }
    .wheel-svg {
      width: 260px; height: 260px;
      transform-origin: 130px 130px;
    }
    .hub {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
      width: 52px; height: 52px; border-radius: 50%;
      background: radial-gradient(#0c1e36, #050d1a);
      border: 3px solid rgba(212,175,55,0.6);
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 0 20px rgba(212,175,55,0.25); z-index: 5;
    }
    .hub-num { font-family: Georgia, serif; font-size: 17px; font-weight: 700; color: #10b981; }

    .historial { display: flex; gap: 5px; flex-wrap: wrap; justify-content: center; }
    .hist-num {
      width: 28px; height: 28px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 10px; font-weight: 700; font-variant-numeric: tabular-nums;
    }
    .h-r { background: #7f1d1d; color: #fca5a5; }
    .h-b { background: #1a1a2e; color: #9ca3af; border: 1px solid rgba(255,255,255,0.08); }
    .h-g { background: #14532d; color: #86efac; }

    /* BETS PANEL */
    .panel-apuestas { display: flex; flex-direction: column; gap: 14px; }
    .tabs { display: flex; gap: 6px; flex-wrap: wrap; }
    .tab {
      font-size: 11px; padding: 6px 14px; border-radius: 20px;
      background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
      color: #6a8a7a; cursor: pointer;
    }
    .tab.activa { background: rgba(16,185,129,0.12); border-color: rgba(16,185,129,0.3); color: #10b981; }

    .num-grid {
      display: grid; grid-template-columns: repeat(12, 1fr); gap: 3px;
    }
    .num {
      aspect-ratio: 1; display: flex; align-items: center; justify-content: center;
      border: 0; border-radius: 4px; font-size: 10px; font-weight: 700;
      cursor: pointer; font-variant-numeric: tabular-nums;
    }
    .num.green  { grid-column: 1 / -1; width: 36px; background: #14532d; color: #86efac; }
    .num.red    { background: #7f1d1d; color: #fca5a5; }
    .num.black  { background: #111827; color: #d1d5db; }
    .num.sel    { outline: 2px solid #d4af37; outline-offset: 1px; }

    .opts-flex { display: flex; gap: 8px; flex-wrap: wrap; }
    .opt-c {
      flex: 1; min-width: 100px; padding: 12px;
      border: 1px solid rgba(255,255,255,0.1);
      background: rgba(255,255,255,0.04); color: #e0f0e8;
      border-radius: 8px; cursor: pointer;
    }
    .opt-rojo  { background: rgba(127,29,29,0.5); color: #fca5a5; border-color: rgba(185,28,28,0.4); }
    .opt-negro { background: rgba(15,15,25,0.7);  color: #c0c0c0; }
    .opt-c.sel { outline: 2px solid #d4af37; outline-offset: 1px; }

    .monto-row { display: flex; gap: 10px; align-items: flex-end; flex-wrap: wrap; }
    .monto-row label { display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: #4a7a64; }
    .monto-row input { width: 110px; }

    .lista-titulo { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #3a6a54; margin: 0 0 8px; }
    .bet-row { display: flex; justify-content: space-between; align-items: center; gap: 8px; padding: 6px 10px; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 12px; color: #8aabaa; }
    .bet-amt { color: #d4af37; font-weight: 700; }
    .gano   { color: #86efac; font-weight: 600; }
    .perdio { color: #fca5a5; }
  `]
})
export class RouletteComponent implements AfterViewInit, OnDestroy {
  @ViewChild('wheelSvg') wheelSvgEl!: ElementRef<SVGElement>;
  @ViewChildren('histItem') histItems!: QueryList<ElementRef<HTMLElement>>;

  tipos = [
    { codigo: 'numero'  as const, nombre: 'Número' },
    { codigo: 'color'   as const, nombre: 'Color' },
    { codigo: 'paridad' as const, nombre: 'Par/Impar' },
    { codigo: 'docena'  as const, nombre: 'Docena' },
  ];
  numeros = Array.from({ length: 36 }, (_, i) => i + 1);
  tipo: ApuestaRuleta['tipo'] = 'color';
  valor: any = null;
  monto = 100;
  apuestas: ApuestaRuleta[] = [];
  resultado: ResultadoRuleta | null = null;
  historial: number[] = [];
  girando = false;
  error = '';

  private currentRotation = 0;

  isRojo = (n: number) => RED.has(n);

  constructor(private casino: CasinoService) {}

  ngAfterViewInit(): void {
    this.buildWheel();
  }

  private buildWheel(): void {
    const svg = this.wheelSvgEl.nativeElement;
    const cx = 150, cy = 150, outerR = 148, innerR = 58, numR = 115;
    const total = WHEEL_ORDER.length;
    const step  = (2 * Math.PI) / total;
    const base  = -Math.PI / 2;

    WHEEL_ORDER.forEach((n, i) => {
      const sa = base + i * step, ea = base + (i + 1) * step;
      const ma = base + (i + 0.5) * step;
      const o1 = polar(cx, cy, outerR, sa), o2 = polar(cx, cy, outerR, ea);
      const i1 = polar(cx, cy, innerR, ea), i2 = polar(cx, cy, innerR, sa);

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d',
        `M${o1.x} ${o1.y} A${outerR} ${outerR} 0 0 1 ${o2.x} ${o2.y}` +
        `L${i1.x} ${i1.y} A${innerR} ${innerR} 0 0 0 ${i2.x} ${i2.y}Z`
      );
      path.setAttribute('fill',   segColor(n));
      path.setAttribute('stroke', strokeColor(n));
      path.setAttribute('stroke-width', '0.8');
      svg.appendChild(path);

      const tp  = polar(cx, cy, numR, ma);
      const deg = (ma * 180 / Math.PI) + 90;
      const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      txt.setAttribute('x', String(tp.x));
      txt.setAttribute('y', String(tp.y));
      txt.setAttribute('text-anchor', 'middle');
      txt.setAttribute('dominant-baseline', 'central');
      txt.setAttribute('transform', `rotate(${deg}, ${tp.x}, ${tp.y})`);
      txt.setAttribute('fill', textColor(n));
      txt.setAttribute('font-size', '7.5');
      txt.setAttribute('font-weight', '700');
      txt.setAttribute('font-family', 'Georgia, serif');
      txt.textContent = String(n);
      svg.appendChild(txt);
    });

    // rings
    [outerR, innerR].forEach(r => {
      const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('cx', String(cx)); c.setAttribute('cy', String(cy));
      c.setAttribute('r', String(r));
      c.setAttribute('fill', r === innerR ? '#060f1e' : 'none');
      c.setAttribute('stroke', 'rgba(212,175,55,0.45)');
      c.setAttribute('stroke-width', r === outerR ? '2' : '1.5');
      svg.appendChild(c);
    });
  }

  get totalApostado(): number {
    return this.apuestas.reduce((s, a) => s + Number(a.monto), 0);
  }

  puedeAgregar(): boolean {
    return this.monto >= 10 && this.monto <= 1000 && this.valor !== null;
  }

  agregar(): void {
    this.apuestas.push({ tipo: this.tipo, valor: this.valor, monto: this.monto });
  }

  girar(): void {
    if (!this.apuestas.length) return;
    this.error     = '';
    this.resultado = null;
    this.girando   = true;

    this.casino.jugarRuleta(this.apuestas).subscribe({
      next:  r => this.animarRueda(r.resultado),
      error: e => {
        this.girando = false;
        this.error = e.error?.error || 'No se pudo jugar';
      }
    });
  }

  private animarRueda(resultado: ResultadoRuleta): void {
    const idx        = WHEEL_ORDER.indexOf(resultado.numero);
    const total      = WHEEL_ORDER.length;
    const segDeg     = 360 / total;
    const targetDeg  = -(idx * segDeg + segDeg / 2);
    const spins      = 360 * (4 + Math.random() * 2);
    const finalAngle = this.currentRotation + spins + targetDeg - (this.currentRotation % 360);

    gsap.to(this.wheelSvgEl.nativeElement, {
      rotation: finalAngle,
      transformOrigin: '150px 150px',
      duration: 4 + Math.random(),
      ease: 'power4.out',
      onComplete: () => {
        this.currentRotation = finalAngle % 360;
        this.resultado  = resultado;
        this.girando    = false;
        this.apuestas   = [];
        this.addToHistory(resultado.numero);
      }
    });

    // Pointer vibration while decelerating
    gsap.to(this.wheelSvgEl.nativeElement, {
      x: '+=2', yoyo: true, repeat: 20, duration: 0.08,
      ease: 'none', delay: 2
    });
  }

  private addToHistory(n: number): void {
    this.historial = [n, ...this.historial].slice(0, 7);
    setTimeout(() => {
      const items = this.histItems.toArray();
      if (items.length) {
        gsap.from(items[0].nativeElement, {
          x: 20, opacity: 0, duration: 0.25, ease: 'power2.out'
        });
      }
    }, 0);
  }

  describir(a: ApuestaRuleta): string {
    switch (a.tipo) {
      case 'numero':  return `Número ${a.valor}`;
      case 'color':   return `Color ${a.valor}`;
      case 'paridad': return a.valor === 'par' ? 'Pares' : 'Impares';
      case 'docena':  return `Docena ${a.valor}`;
    }
  }

  ngOnDestroy(): void {
    gsap.killTweensOf(this.wheelSvgEl?.nativeElement);
  }
}
```

- [ ] **Step 2: Verificar build**

```bash
ng build 2>&1 | tail -5
```

- [ ] **Step 3: Verificar visual**

Navegar a Ruleta → verificar:
- Rueda con los 37 números visibles en colores correctos (rojo/negro/verde)
- La rueda gira y desacelera hasta detenerse en el número ganador
- Cada resultado nuevo aparece en el historial con slide-in desde la derecha

- [ ] **Step 4: Commit**

```bash
git add src/app/components/roulette/roulette.component.ts
git commit -m "feat: ruleta con SVG de 37 segmentos europeos y giro GSAP power4.out"
```

---

## Task 8: Blackjack — cartas CSS, deal animado y flip 3D

**Files:**
- Modify: `src/app/components/blackjack/blackjack.component.ts`

- [ ] **Step 1: Reemplazar blackjack.component.ts completo**

```typescript
import {
  Component, OnDestroy, ViewChildren, QueryList, ElementRef, SimpleChanges, OnChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { gsap } from 'gsap';
import { CasinoService } from '../../services/casino.service';
import { Carta, EstadoBlackjack } from '../../models/casino.models';
import { spawnVictoryParticles } from '../../utils/particles';

@Component({
  selector: 'app-blackjack',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="tarjeta b-cont">
      <h2 class="titulo-juego">♣ Blackjack</h2>

      <div *ngIf="estado; else inicio" class="mesa">

        <!-- BANCA -->
        <div class="lado">
          <p class="lado-label">
            Banca
            <span *ngIf="estado.terminada" class="score">{{ estado.totales?.banca }}</span>
          </p>
          <div class="cartas">
            <div #dealCard *ngFor="let c of estado.banca" class="pcard"
                 [class.face-down]="c.oculta"
                 [class.face-up]="!c.oculta"
                 [class.red]="esRojo(c)">
              <ng-container *ngIf="!c.oculta">
                <span class="corner tl">{{ c.valor }}<br><small>{{ c.palo }}</small></span>
                <span class="center">{{ c.palo }}</span>
                <span class="corner br">{{ c.valor }}<br><small>{{ c.palo }}</small></span>
              </ng-container>
              <span *ngIf="c.oculta" class="hidden-mark">?</span>
            </div>
          </div>
        </div>

        <div class="divisor"></div>

        <!-- JUGADOR -->
        <div class="lado">
          <p class="lado-label">
            Tú
            <span class="score gold">{{ valorMano(estado.jugador) }}</span>
          </p>
          <div class="cartas">
            <div #dealCard *ngFor="let c of estado.jugador" class="pcard face-up"
                 [class.red]="esRojo(c)">
              <span class="corner tl">{{ c.valor }}<br><small>{{ c.palo }}</small></span>
              <span class="center">{{ c.palo }}</span>
              <span class="corner br">{{ c.valor }}<br><small>{{ c.palo }}</small></span>
            </div>
          </div>
        </div>

        <!-- RESULTADO -->
        <div *ngIf="estado.terminada" class="resultado-banner">
          <p [ngSwitch]="estado.resultado">
            <span *ngSwitchCase="'gana'"      class="gano">Ganaste +$ {{ estado.retorno - estado.apuesta | number:'1.0-0' }}</span>
            <span *ngSwitchCase="'blackjack'" class="gano">Blackjack! +$ {{ estado.retorno - estado.apuesta | number:'1.0-0' }}</span>
            <span *ngSwitchCase="'pierde'"    class="perdio">Pierdes –$ {{ estado.apuesta | number:'1.0-0' }}</span>
            <span *ngSwitchCase="'empate'"    class="empate">Empate</span>
          </p>
          <button class="btn btn-primario" (click)="reiniciar()">Nueva mano</button>
        </div>

        <!-- ACCIONES -->
        <div *ngIf="!estado.terminada" class="acciones">
          <button class="btn btn-verde"     (click)="accion('pedir')"    [disabled]="cargando">Pedir</button>
          <button class="btn btn-rojo"      (click)="accion('plantarse')" [disabled]="cargando">Plantarse</button>
          <button class="btn btn-secundario"(click)="accion('doblar')"
                  [disabled]="cargando || estado.jugador.length !== 2">Doblar</button>
          <span class="apuesta-disp">Apuesta: <strong>$ {{ estado.apuesta | number:'1.0-0' }}</strong></span>
        </div>
      </div>

      <ng-template #inicio>
        <div class="iniciar tarjeta">
          <p class="sub">Apuesta entre $20 y $2,000.</p>
          <label>Apuesta
            <input type="number" [(ngModel)]="apuesta" min="20" max="2000" step="20" />
          </label>
          <button class="btn btn-primario" (click)="iniciar()" [disabled]="cargando">
            {{ cargando ? 'Repartiendo...' : 'Repartir' }}
          </button>
        </div>
      </ng-template>

      <p *ngIf="error" class="error">{{ error }}</p>
    </section>
  `,
  styles: [`
    .b-cont { max-width: 740px; margin: 20px auto; }

    .iniciar { text-align: center; background: rgba(255,255,255,0.02); }
    .iniciar label { display: inline-flex; flex-direction: column; gap: 6px; margin: 14px; font-size: 14px; color: #4a7a64; }
    .iniciar input { width: 130px; }
    .sub { color: #4a7a64; font-size: 13px; margin-bottom: 6px; }

    .lado { margin: 18px 0; }
    .lado-label {
      font-size: 10px; letter-spacing: 3px; text-transform: uppercase;
      color: #3a6a54; margin: 0 0 12px; display: flex; align-items: center; gap: 10px;
    }
    .score {
      background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.25);
      border-radius: 20px; padding: 1px 10px;
      font-size: 12px; color: #10b981; font-weight: 700;
    }
    .score.gold { background: rgba(212,175,55,0.1); border-color: rgba(212,175,55,0.25); color: #d4af37; }

    .cartas { display: flex; gap: 10px; flex-wrap: wrap; }
    .divisor { width: 100%; height: 1px; background: linear-gradient(90deg, transparent, rgba(16,185,129,0.15), transparent); margin: 4px 0; }

    /* CSS Cards */
    .pcard {
      width: 68px; height: 96px; border-radius: 8px;
      position: relative;
      box-shadow: 0 6px 18px rgba(0,0,0,0.55), 0 1px 3px rgba(0,0,0,0.3);
      transform-style: preserve-3d;
    }
    .pcard.face-up  { background: #fff; }
    .pcard.face-down {
      background: linear-gradient(135deg, #1e3a8a, #1e40af);
      border: 2px solid rgba(255,255,255,0.15);
    }
    .corner {
      position: absolute; font-family: Georgia, serif;
      font-size: 12px; font-weight: 700; line-height: 1.1; color: #1a1a1a;
    }
    .corner small { font-size: 10px; display: block; }
    .tl { top: 5px; left: 6px; }
    .br { bottom: 5px; right: 6px; transform: rotate(180deg); }
    .center {
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%,-50%);
      font-family: Georgia, serif; font-size: 20px; font-weight: 700; color: #1a1a1a;
    }
    .pcard.red .corner, .pcard.red .center { color: #b91c1c; }
    .hidden-mark {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
      font-size: 28px; color: rgba(255,255,255,0.5); font-weight: 700;
    }

    /* Acciones */
    .acciones { display: flex; gap: 10px; align-items: center; margin-top: 18px; flex-wrap: wrap; }
    .apuesta-disp { margin-left: auto; font-size: 13px; color: #4a7a64; }
    .apuesta-disp strong { color: #d4af37; }

    /* Resultado */
    .resultado-banner { text-align: center; margin-top: 20px; }
    .resultado-banner p { font-size: 22px; margin: 0 0 16px; }
    .gano   { color: #86efac; font-weight: 700; }
    .perdio { color: #fca5a5; font-weight: 700; }
    .empate { color: #d4af37; font-weight: 700; }
  `]
})
export class BlackjackComponent implements OnDestroy {
  apuesta  = 100;
  estado: EstadoBlackjack | null = null;
  cargando = false;
  error    = '';

  @ViewChildren('dealCard') dealCards!: QueryList<ElementRef<HTMLElement>>;
  private prevCardCount = 0;

  constructor(private casino: CasinoService) {}

  esRojo(c: Carta): boolean {
    return c.palo === '♥' || c.palo === '♦';
  }

  iniciar(): void {
    this.error    = '';
    this.cargando = true;
    this.casino.blackjackIniciar(this.apuesta).subscribe({
      next:  e => { this.estado = e; this.cargando = false; this.animarNuevasCartas(); },
      error: e => { this.cargando = false; this.error = e.error?.error || 'No se pudo iniciar la mano'; }
    });
  }

  accion(a: 'pedir' | 'plantarse' | 'doblar'): void {
    if (!this.estado) return;
    this.error    = '';
    this.cargando = true;
    this.casino.blackjackAccion(this.estado.sesionId, a).subscribe({
      next: e => {
        const prevBancaHidden = this.estado!.banca.filter(c => c.oculta).length;
        this.estado   = e;
        this.cargando = false;
        this.animarNuevasCartas();
        // Flip hidden card if now revealed
        if (e.terminada && prevBancaHidden > 0) this.flipHiddenCards();
        if (e.terminada && (e.resultado === 'gana' || e.resultado === 'blackjack')) {
          setTimeout(() => spawnVictoryParticles(), 300);
        }
      },
      error: e => { this.cargando = false; this.error = e.error?.error || 'Acción inválida'; }
    });
  }

  private animarNuevasCartas(): void {
    setTimeout(() => {
      const cards = this.dealCards.toArray();
      const newCards = cards.slice(this.prevCardCount);
      newCards.forEach((el, i) => {
        gsap.from(el.nativeElement, {
          y: -80, x: 0, rotation: -15, opacity: 0,
          duration: 0.45, ease: 'back.out(1.5)',
          delay: i * 0.15,
        });
      });
      this.prevCardCount = cards.length;
    }, 0);
  }

  private flipHiddenCards(): void {
    setTimeout(() => {
      const cards = this.dealCards.toArray();
      cards.forEach(el => {
        if (el.nativeElement.classList.contains('face-down')) {
          gsap.to(el.nativeElement, {
            rotateY: 90, duration: 0.3, ease: 'power2.in',
            onComplete: () => {
              el.nativeElement.classList.remove('face-down');
              el.nativeElement.classList.add('face-up');
              gsap.from(el.nativeElement, { rotateY: -90, duration: 0.3, ease: 'power2.out' });
            }
          });
        }
      });
    }, 0);
  }

  reiniciar(): void {
    this.estado        = null;
    this.error         = '';
    this.prevCardCount = 0;
  }

  valorMano(cartas: Carta[]): number {
    let total = 0, ases = 0;
    for (const c of cartas) {
      if (c.oculta) continue;
      if (c.valor === 'A') { total += 11; ases++; }
      else if (['J','Q','K'].includes(c.valor)) total += 10;
      else total += Number(c.valor);
    }
    while (total > 21 && ases > 0) { total -= 10; ases--; }
    return total;
  }

  ngOnDestroy(): void {
    gsap.killTweensOf(this.dealCards?.map(r => r.nativeElement) ?? []);
  }
}
```

- [ ] **Step 2: Verificar build**

```bash
ng build 2>&1 | tail -5
```

- [ ] **Step 3: Verificar visual**

Navegar a Blackjack → verificar:
- Las cartas CSS se ven con tipografía Georgia y colores rojo/negro correctos
- Al repartir, las cartas vuelan desde arriba con efecto bounce
- Al plantarse, la carta oculta de la banca hace flip 3D antes de mostrarse
- Al ganar/Blackjack: partículas Three.js caen desde arriba

- [ ] **Step 4: Commit**

```bash
git add src/app/components/blackjack/blackjack.component.ts
git commit -m "feat: blackjack con cartas CSS, deal GSAP y flip 3D al revelar"
```

---

## Task 9: Login y Register — entrada animada

**Files:**
- Modify: `src/app/components/login/login.component.ts`
- Modify: `src/app/components/register/register.component.ts`

- [ ] **Step 1: Reemplazar login.component.ts**

```typescript
import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { gsap } from 'gsap';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="caja tarjeta" #card>
      <p class="eyebrow">Acceso</p>
      <h2 class="titulo-juego">Bienvenido al Casino</h2>
      <p class="hint">Demo: <code>demo</code> / <code>demo1234</code></p>

      <form (submit)="ingresar(); $event.preventDefault()">
        <label #field>Usuario
          <input [(ngModel)]="username" name="username" autocomplete="username" required />
        </label>
        <label #field>Contraseña
          <input [(ngModel)]="password" name="password" type="password"
                 autocomplete="current-password" required />
        </label>
        <button #field class="btn btn-primario" [disabled]="cargando">
          {{ cargando ? 'Ingresando...' : 'Entrar' }}
        </button>
      </form>

      <p *ngIf="error" class="error">{{ error }}</p>
      <p class="alt">¿Sin cuenta? <a routerLink="/register">Regístrate</a></p>
    </section>
  `,
  styles: [`
    .caja { max-width: 380px; margin: 60px auto; }
    .eyebrow { font-size: 10px; letter-spacing: 4px; text-transform: uppercase; color: #10b981; margin-bottom: 8px; opacity: 0.75; }
    form { display: flex; flex-direction: column; gap: 14px; margin-top: 14px; }
    label { display: flex; flex-direction: column; gap: 6px; font-size: 14px; color: #4a7a64; }
    .hint { color: #4a7a64; font-size: 13px; margin-top: -4px; }
    .alt { margin-top: 18px; text-align: center; color: #4a7a64; font-size: 13px; }
    code { background: rgba(255,255,255,.06); padding: 1px 6px; border-radius: 4px; color: #d4af37; }
  `]
})
export class LoginComponent implements AfterViewInit, OnDestroy {
  @ViewChild('card')          cardEl!: ElementRef<HTMLElement>;
  @ViewChildren('field')      fields!: QueryList<ElementRef<HTMLElement>>;

  username = ''; password = ''; cargando = false; error = '';

  constructor(private auth: AuthService, private router: Router) {}

  ngAfterViewInit(): void {
    gsap.from(this.cardEl.nativeElement, {
      scale: 0.95, opacity: 0, duration: 0.5, ease: 'power2.out'
    });
    gsap.from(this.fields.map(f => f.nativeElement), {
      opacity: 0, y: 10, duration: 0.4, ease: 'power2.out',
      stagger: 0.06, delay: 0.2
    });
  }

  ingresar(): void {
    this.error = ''; this.cargando = true;
    this.auth.login(this.username, this.password).subscribe({
      next:  () => { this.cargando = false; this.router.navigateByUrl('/lobby'); },
      error: e  => { this.cargando = false; this.error = e.error?.error || 'Credenciales inválidas'; }
    });
  }

  ngOnDestroy(): void {
    gsap.killTweensOf(this.cardEl?.nativeElement);
  }
}
```

- [ ] **Step 2: Reemplazar register.component.ts**

```typescript
import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { gsap } from 'gsap';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="caja tarjeta" #card>
      <p class="eyebrow">Registro</p>
      <h2 class="titulo-juego">Crea tu cuenta</h2>

      <form (submit)="registrar(); $event.preventDefault()">
        <label #field>Usuario
          <input [(ngModel)]="username" name="username" required minlength="3" />
        </label>
        <label #field>Email
          <input [(ngModel)]="email" name="email" type="email" required />
        </label>
        <label #field>Contraseña
          <input [(ngModel)]="password" name="password" type="password" required minlength="6" />
        </label>
        <button #field class="btn btn-primario" [disabled]="cargando">
          {{ cargando ? 'Creando...' : 'Crear cuenta' }}
        </button>
      </form>

      <p *ngIf="error" class="error">{{ error }}</p>
      <p class="alt">¿Ya tienes cuenta? <a routerLink="/login">Inicia sesión</a></p>
    </section>
  `,
  styles: [`
    .caja { max-width: 380px; margin: 60px auto; }
    .eyebrow { font-size: 10px; letter-spacing: 4px; text-transform: uppercase; color: #10b981; margin-bottom: 8px; opacity: 0.75; }
    form { display: flex; flex-direction: column; gap: 14px; margin-top: 14px; }
    label { display: flex; flex-direction: column; gap: 6px; font-size: 14px; color: #4a7a64; }
    .alt { margin-top: 18px; text-align: center; color: #4a7a64; font-size: 13px; }
  `]
})
export class RegisterComponent implements AfterViewInit, OnDestroy {
  @ViewChild('card')     cardEl!: ElementRef<HTMLElement>;
  @ViewChildren('field') fields!: QueryList<ElementRef<HTMLElement>>;

  username = ''; email = ''; password = ''; cargando = false; error = '';

  constructor(private auth: AuthService, private router: Router) {}

  ngAfterViewInit(): void {
    gsap.from(this.cardEl.nativeElement, {
      scale: 0.95, opacity: 0, duration: 0.5, ease: 'power2.out'
    });
    gsap.from(this.fields.map(f => f.nativeElement), {
      opacity: 0, y: 10, duration: 0.4, ease: 'power2.out',
      stagger: 0.06, delay: 0.2
    });
  }

  registrar(): void {
    this.error = ''; this.cargando = true;
    this.auth.registrar({ username: this.username, email: this.email, password: this.password })
      .subscribe({
        next:  () => { this.cargando = false; this.router.navigateByUrl('/lobby'); },
        error: e  => { this.cargando = false; this.error = e.error?.error || 'No se pudo crear la cuenta'; }
      });
  }

  ngOnDestroy(): void {
    gsap.killTweensOf(this.cardEl?.nativeElement);
  }
}
```

- [ ] **Step 3: Verificar build final completo**

```bash
ng build 2>&1 | tail -8
```

Resultado esperado: build exitoso, sin errores ni warnings críticos.

- [ ] **Step 4: Verificar visual completo**

```bash
ng serve
```

Recorrer toda la app y verificar:
- Login y Register: card entra con scale+fade, campos en stagger
- Lobby: hero y cards en cascada, hover 3D funciona
- Slots: rodillos con física elástica, partículas al ganar
- Ruleta: rueda SVG de 37 números, giro hasta número correcto
- Blackjack: cartas CSS, deal animado, flip de carta oculta, partículas al ganar
- Fondo Three.js: naipes flotando con parallax en toda la app
- Header: shimmer dorado, dot pulsante, count-up al cambiar saldo

- [ ] **Step 5: Commit final**

```bash
git add src/app/components/login/login.component.ts src/app/components/register/register.component.ts
git commit -m "feat: login y register con entrada animada GSAP — rediseño visual completo"
```
