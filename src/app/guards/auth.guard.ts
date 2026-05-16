/**
 * auth.guard.ts — Guard de ruta funcional (Angular 17)
 *
 * Un guard de ruta decide si el usuario puede acceder a una URL.
 * Se declara en app.routes.ts con canActivate: [authGuard].
 *
 * Lógica:
 *   - Si autenticado() es true (hay JWT en memoria) → permite el acceso.
 *   - Si no hay sesión → redirige a /login y bloquea la navegación.
 *
 * autenticado() es un signal computed de AuthService que devuelve
 * true cuando _token() tiene un valor distinto de null.
 *
 * CanActivateFn es el tipo funcional de Angular 17 para guards.
 * La versión anterior usaba clases que implementaban CanActivate.
 */
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.autenticado()) return true;

  router.navigateByUrl('/login');
  return false;
};
