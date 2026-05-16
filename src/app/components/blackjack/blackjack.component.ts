import {
  Component, OnDestroy, ViewChildren, QueryList, ElementRef
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

        <div *ngIf="estado.terminada" class="resultado-banner">
          <p [ngSwitch]="estado.resultado">
            <span *ngSwitchCase="'gana'"      class="gano">Ganaste +$ {{ estado.retorno - estado.apuesta | number:'1.0-0' }}</span>
            <span *ngSwitchCase="'blackjack'" class="gano">Blackjack! +$ {{ estado.retorno - estado.apuesta | number:'1.0-0' }}</span>
            <span *ngSwitchCase="'pierde'"    class="perdio">Pierdes –$ {{ estado.apuesta | number:'1.0-0' }}</span>
            <span *ngSwitchCase="'empate'"    class="empate">Empate</span>
          </p>
          <button class="btn btn-primario" (click)="reiniciar()">Nueva mano</button>
        </div>

        <div *ngIf="!estado.terminada" class="acciones">
          <button class="btn btn-verde"     (click)="accion('pedir')"     [disabled]="cargando">Pedir</button>
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

    .acciones { display: flex; gap: 10px; align-items: center; margin-top: 18px; flex-wrap: wrap; }
    .apuesta-disp { margin-left: auto; font-size: 13px; color: #4a7a64; }
    .apuesta-disp strong { color: #d4af37; }

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

    // Captura elementos con face-down ANTES del update de estado
    const hiddenEls = this.dealCards.toArray()
      .filter(el => el.nativeElement.classList.contains('face-down'));

    this.casino.blackjackAccion(this.estado.sesionId, a).subscribe({
      next: e => {
        this.estado   = e;
        this.cargando = false;
        this.animarNuevasCartas();
        if (e.terminada && hiddenEls.length > 0) this.flipElements(hiddenEls);
        if (e.terminada && (e.resultado === 'gana' || e.resultado === 'blackjack')) {
          setTimeout(() => spawnVictoryParticles(), 500);
        }
      },
      error: e => { this.cargando = false; this.error = e.error?.error || 'Acción inválida'; }
    });
  }

  private animarNuevasCartas(): void {
    setTimeout(() => {
      const all = this.dealCards.toArray();
      const nuevas = all.slice(this.prevCardCount);
      nuevas.forEach((el, i) => {
        gsap.from(el.nativeElement, {
          y: -80, rotation: -15, opacity: 0,
          duration: 0.45, ease: 'back.out(1.5)',
          delay: i * 0.15,
        });
      });
      this.prevCardCount = all.length;
    }, 0);
  }

  private flipElements(hiddenEls: ElementRef<HTMLElement>[]): void {
    hiddenEls.forEach(el => {
      const node = el.nativeElement;
      // Restaura face-down temporalmente para animar el flip antes del re-render
      node.classList.add('face-down');
      node.classList.remove('face-up');
      gsap.to(node, {
        rotateY: 90, duration: 0.3, ease: 'power2.in',
        onComplete: () => {
          node.classList.remove('face-down');
          node.classList.add('face-up');
          gsap.from(node, { rotateY: -90, duration: 0.3, ease: 'power2.out' });
        }
      });
    });
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
