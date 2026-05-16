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
  @ViewChild('card')     cardEl!: ElementRef<HTMLElement>;
  @ViewChildren('field') fields!: QueryList<ElementRef<HTMLElement>>;

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
