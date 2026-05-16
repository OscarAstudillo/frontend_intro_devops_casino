/**
 * auth.interceptor.ts — Interceptor HTTP funcional (Angular 17)
 *
 * Un interceptor se ejecuta automáticamente en CADA petición HTTP que
 * hace la app. Este interceptor hace dos cosas:
 *
 * 1. ADJUNTAR JWT: Si hay un token en AuthService, clona la petición
 *    original y le añade el header "Authorization: Bearer <token>".
 *    El backend valida ese token en cada endpoint protegido.
 *    Se clona (req.clone) porque los objetos HttpRequest son inmutables.
 *
 * 2. MANEJAR 401: Si el servidor responde con HTTP 401 (token expirado
 *    o inválido), el interceptor cierra la sesión y redirige al login.
 *    Esto evita que el usuario quede en un estado inconsistente.
 *
 * El interceptor se registra en main.ts:
 *   provideHttpClient(withInterceptors([authInterceptor]))
 */
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  const token  = auth.token();

  // Añadir JWT al header si el usuario tiene sesión activa
  const reqAuth = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(reqAuth).pipe(
    catchError((err) => {
      // Token expirado o inválido → cerrar sesión y volver al login
      if (err.status === 401) {
        auth.logout();
        router.navigateByUrl('/login');
      }
      return throwError(() => err);
    })
  );
};
