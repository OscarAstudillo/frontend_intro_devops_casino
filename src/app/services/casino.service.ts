/**
 * casino.service.ts — Servicio de dominio: juegos, perfil e historial
 *
 * Centraliza todas las llamadas HTTP a la API del backend.
 * Cada método devuelve un Observable que el componente debe suscribir.
 *
 * PATRÓN tap():
 *   tap() ejecuta un efecto secundario sin modificar el valor del stream.
 *   Aquí se usa para actualizar el saldo en AuthService cada vez que
 *   el backend devuelve el saldo actualizado tras una jugada.
 *   Así el header refleja el saldo en tiempo real sin código extra
 *   en cada componente.
 *
 * environment.apiBaseUrl:
 *   En desarrollo → 'http://localhost:3000'
 *   En producción → '' (cadena vacía = rutas relativas via nginx)
 *   Ver environments/environment.prod.ts para la explicación completa.
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import {
  Juego, Transaccion, ResultadoSlots, ResultadoRuleta,
  ApuestaRuleta, EstadoBlackjack, Usuario
} from '../models/casino.models';

@Injectable({ providedIn: 'root' })
export class CasinoService {
  private readonly api = environment.apiBaseUrl;

  constructor(private http: HttpClient, private auth: AuthService) {}

  // ---------- Catálogo ----------
  listarJuegos() {
    return this.http.get<Juego[]>(`${this.api}/api/juegos`);
  }

  // ---------- Perfil ----------
  miPerfil() {
    return this.http.get<Usuario>(`${this.api}/api/usuarios/me`)
      .pipe(tap((u) => this.auth.setUsuario(u)));
  }

  depositar(monto: number) {
    return this.http.post<{ saldo: number }>(`${this.api}/api/usuarios/me/depositar`, { monto })
      .pipe(tap((r) => this.auth.setSaldo(r.saldo)));
  }

  // ---------- Historial ----------
  historial(limit = 50) {
    return this.http.get<Transaccion[]>(`${this.api}/api/transacciones?limit=${limit}`);
  }

  // ---------- Slots ----------
  jugarSlots(apuesta: number) {
    return this.http.post<{ resultado: ResultadoSlots; saldo: number }>(
      `${this.api}/api/juegos/slots/jugar`, { apuesta }
    ).pipe(tap((r) => this.auth.setSaldo(r.saldo)));
  }

  // ---------- Ruleta ----------
  jugarRuleta(apuestas: ApuestaRuleta[]) {
    return this.http.post<{ resultado: ResultadoRuleta; saldo: number }>(
      `${this.api}/api/juegos/roulette/jugar`, { apuestas }
    ).pipe(tap((r) => this.auth.setSaldo(r.saldo)));
  }

  // ---------- Blackjack ----------
  blackjackIniciar(apuesta: number) {
    return this.http.post<EstadoBlackjack>(
      `${this.api}/api/juegos/blackjack/iniciar`, { apuesta }
    ).pipe(tap((r) => this.auth.setSaldo(r.saldo)));
  }

  blackjackAccion(sesionId: number, accion: 'pedir' | 'plantarse' | 'doblar') {
    return this.http.post<EstadoBlackjack>(
      `${this.api}/api/juegos/blackjack/accion`, { sesionId, accion }
    ).pipe(tap((r) => this.auth.setSaldo(r.saldo)));
  }
}
