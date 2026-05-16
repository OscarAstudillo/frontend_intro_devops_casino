/**
 * auth.service.ts — Servicio de autenticación con Angular Signals
 *
 * Gestiona el estado de sesión: usuario autenticado, token JWT y saldo.
 *
 * SIGNALS (Angular 17):
 *   signal()    → crea un valor reactivo mutable (_usuario, _token).
 *   computed()  → valor derivado que se recalcula cuando cambia su dependencia.
 *   asReadonly()→ expone el signal sin permitir mutación desde fuera.
 *
 *   Los componentes pueden leer los signals directamente en el template:
 *     {{ auth.usuario()?.username }}   (la llamada () lee el valor actual)
 *
 * PERSISTENCIA:
 *   La sesión se guarda en localStorage para sobrevivir recargas de página.
 *   Al iniciar la app, el servicio restaura la sesión del storage.
 *   Riesgo: localStorage es accesible por JS de la misma origin —
 *   en producción real se usaría httpOnly cookie; aquí es suficiente para el lab.
 *
 * FLUJO DE LOGIN:
 *   1. login() hace POST /api/auth/login
 *   2. El backend devuelve { usuario, token }
 *   3. persistir() guarda ambos en signals y en localStorage
 *   4. authInterceptor lee auth.token() y adjunta el JWT
 */
import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { RespuestaAuth, Usuario } from '../models/casino.models';

const STORAGE_KEY = 'casino.session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = environment.apiBaseUrl;

  // Signals privados (mutables solo dentro del servicio)
  private readonly _usuario = signal<Usuario | null>(this.cargarSesion()?.usuario ?? null);
  private readonly _token   = signal<string | null>(this.cargarSesion()?.token   ?? null);

  // Signals públicos de solo lectura que consumen los componentes
  readonly usuario     = this._usuario.asReadonly();
  readonly token       = this._token.asReadonly();
  readonly autenticado = computed(() => !!this._token()); // true si hay JWT

  constructor(private http: HttpClient) {}

  registrar(datos: { username: string; email: string; password: string }) {
    return this.http.post<RespuestaAuth>(`${this.api}/api/auth/register`, datos)
      .pipe(tap((r) => this.persistir(r)));
  }

  login(username: string, password: string) {
    return this.http.post<RespuestaAuth>(`${this.api}/api/auth/login`, { username, password })
      .pipe(tap((r) => this.persistir(r)));
  }

  logout() {
    this._usuario.set(null);
    this._token.set(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  // Llamado por CasinoService cada vez que el backend retorna el nuevo saldo
  setSaldo(saldo: number) {
    const u = this._usuario();
    if (u) this._usuario.set({ ...u, saldo });
    this.guardarLocal();
  }

  setUsuario(usuario: Usuario) {
    this._usuario.set(usuario);
    this.guardarLocal();
  }

  private persistir(r: RespuestaAuth) {
    this._usuario.set(r.usuario);
    this._token.set(r.token);
    this.guardarLocal();
  }

  private guardarLocal() {
    const data = { usuario: this._usuario(), token: this._token() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  private cargarSesion(): { usuario: Usuario; token: string } | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }
}
