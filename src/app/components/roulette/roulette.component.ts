import {
  Component, AfterViewInit, OnDestroy,
  ViewChild, ViewChildren, QueryList, ElementRef
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
        <div class="panel-rueda">
          <div class="wheel-wrap">
            <div class="outer-deco"></div>
            <div class="pointer"></div>
            <!-- Wrapper div rotado por GSAP; el hub queda fuera para no girar -->
            <div #wheelWrapper class="wheel-wrapper">
              <svg #wheelSvg class="wheel-svg" viewBox="0 0 300 300"></svg>
            </div>
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

        <div class="panel-apuestas">
          <div class="tabs">
            <button *ngFor="let t of tipos" class="tab"
                    [class.activa]="tipo === t.codigo"
                    (click)="tipo = t.codigo; valor = null">
              {{ t.nombre }}
            </button>
          </div>

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

          <div *ngIf="tipo === 'color'" class="opts-flex">
            <button class="opt-c opt-rojo"  [class.sel]="valor === 'rojo'"  (click)="valor = 'rojo'">Rojo</button>
            <button class="opt-c opt-negro" [class.sel]="valor === 'negro'" (click)="valor = 'negro'">Negro</button>
          </div>

          <div *ngIf="tipo === 'paridad'" class="opts-flex">
            <button class="opt-c" [class.sel]="valor === 'par'"   (click)="valor = 'par'">Par</button>
            <button class="opt-c" [class.sel]="valor === 'impar'" (click)="valor = 'impar'">Impar</button>
          </div>

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
    .wheel-wrapper {
      width: 260px; height: 260px;
      position: absolute;
      top: 0; left: 0;
    }
    .wheel-svg { width: 260px; height: 260px; display: block; }
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

    .panel-apuestas { display: flex; flex-direction: column; gap: 14px; }
    .tabs { display: flex; gap: 6px; flex-wrap: wrap; }
    .tab {
      font-size: 11px; padding: 6px 14px; border-radius: 20px;
      background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
      color: #6a8a7a; cursor: pointer;
    }
    .tab.activa { background: rgba(16,185,129,0.12); border-color: rgba(16,185,129,0.3); color: #10b981; }

    .num-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 3px; }
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
  @ViewChild('wheelSvg')     wheelSvgEl!:     ElementRef<SVGElement>;
  @ViewChild('wheelWrapper') wheelWrapperEl!: ElementRef<HTMLElement>;
  @ViewChildren('histItem')  histItems!:      QueryList<ElementRef<HTMLElement>>;

  tipos = [
    { codigo: 'numero'  as ApuestaRuleta['tipo'], nombre: 'Número' },
    { codigo: 'color'   as ApuestaRuleta['tipo'], nombre: 'Color' },
    { codigo: 'paridad' as ApuestaRuleta['tipo'], nombre: 'Par/Impar' },
    { codigo: 'docena'  as ApuestaRuleta['tipo'], nombre: 'Docena' },
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

  // Rotación total acumulada que GSAP tiene aplicada en este momento
  private totalRotation = 0;

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
    const idx    = WHEEL_ORDER.indexOf(resultado.numero);
    const segDeg = 360 / WHEEL_ORDER.length; // 9.7297°

    // El segmento idx tiene su centro a (idx + 0.5) * segDeg grados
    // en sentido horario desde el tope (posición 0° del wrapper en reposo)
    const segCenter = ((idx + 0.5) * segDeg) % 360;

    // Rotación neta que necesita el wrapper para colocar segCenter en el tope (0°):
    // Girando en sentido horario, el segmento que estaba a `segCenter` llega al tope
    // cuando el wrapper ha girado `360 - segCenter` adicionales
    const targetNet = (360 - segCenter + 360) % 360;

    // Cuánto falta girar desde la posición actual para llegar a targetNet (siempre positivo)
    const currentNet = ((this.totalRotation % 360) + 360) % 360;
    let   delta      = (targetNet - currentNet + 360) % 360;
    if (delta < 5) delta += 360; // garantiza al menos una vuelta extra de seguridad

    // Vueltas completas de animación (4-6)
    const spins      = 360 * (4 + Math.floor(Math.random() * 3));
    const finalAngle = this.totalRotation + spins + delta;
    this.totalRotation = finalAngle;

    gsap.to(this.wheelWrapperEl.nativeElement, {
      rotation: finalAngle,
      transformOrigin: '50% 50%',
      duration: 4 + Math.random(),
      ease: 'power4.out',
      onComplete: () => {
        this.resultado = resultado;
        this.girando   = false;
        this.apuestas  = [];
        this.addToHistory(resultado.numero);
      }
    });

    // Vibración del puntero sin acumulación
    const pointer = this.wheelWrapperEl.nativeElement.closest('.wheel-wrap')?.querySelector('.pointer');
    if (pointer) {
      gsap.to(pointer, {
        x: 3, yoyo: true, repeat: 19, duration: 0.07,
        ease: 'none', delay: 2,
        onComplete: () => gsap.set(pointer, { x: 0 })
      });
    }
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
    gsap.killTweensOf(this.wheelWrapperEl?.nativeElement);
  }
}
