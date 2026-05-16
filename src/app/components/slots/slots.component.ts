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
          <div class="rodillo" *ngFor="let s of rodillos; let i = index">
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

    // Espera un tick para que Angular renderice los nuevos strips antes de añadir spinning
    setTimeout(() => {
      this.stripEls.forEach(el => el.nativeElement.classList.add('spinning'));
    }, 0);

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
    const DELAYS = [800, 1100, 1400]; // parada escalonada
    const LAST   = DELAYS[DELAYS.length - 1] + 600; // tiempo total + animación

    // Para cada rodillo: quitar spinning con retardo y animar bounce con CSS
    DELAYS.forEach((delay, i) => {
      setTimeout(() => {
        const el = this.stripEls.toArray()[i];
        if (!el) return;
        const node = el.nativeElement;
        node.classList.remove('spinning');
        // Bounce con CSS transition — sin depender de GSAP onComplete
        node.style.transition = 'none';
        node.style.transform  = 'translateY(-22px)';
        requestAnimationFrame(() => {
          node.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
          node.style.transform  = 'translateY(0)';
        });
      }, delay);
    });

    // Finaliza cuando el último rodillo termina su animación
    setTimeout(() => {
      this.stripEls.forEach(el => {
        el.nativeElement.style.transition = '';
        el.nativeElement.style.transform  = '';
      });
      this.onAllStopped(resultado);
    }, LAST);
  }

  private onAllStopped(resultado: ResultadoSlots): void {
    // Muestra los símbolos ganadores en el centro de cada strip
    this.strips = resultado.rodillos.map(sym => {
      const before = Array.from({ length: 3 }, () => aleatorio());
      const after  = Array.from({ length: 4 }, () => aleatorio());
      return [...before, sym, ...after];
    });
    this.rodillos  = resultado.rodillos;
    this.resultado = resultado;
    this.girando   = false;

    if (resultado.premio > 0) {
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
