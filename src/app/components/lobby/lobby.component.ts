import {
  Component, OnInit, AfterViewInit, OnDestroy,
  ViewChild, ViewChildren, QueryList, ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
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
          <ng-container *ngIf="j.codigo === 'slots'">
            <div class="icon-slots">
              <div class="reel">7</div>
              <div class="reel">♦</div>
              <div class="reel">7</div>
            </div>
          </ng-container>
          <ng-container *ngIf="j.codigo === 'roulette'">
            <div class="icon-roulette">
              <div class="wheel-r">
                <div class="spoke s1"></div><div class="spoke s2"></div>
                <div class="spoke s3"></div><div class="spoke s4"></div>
                <div class="hub-r">0</div>
              </div>
            </div>
          </ng-container>
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

    .icon-slots { display: flex; gap: 6px; align-items: center; }
    .reel {
      width: 30px; height: 38px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(16,185,129,0.35); border-radius: 5px;
      display: flex; align-items: center; justify-content: center;
      font-family: Georgia, serif; font-size: 16px; color: #d4af37;
      box-shadow: 0 0 8px rgba(16,185,129,0.2);
    }

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
  private cardsSub?: Subscription;

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
