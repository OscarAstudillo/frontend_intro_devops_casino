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
