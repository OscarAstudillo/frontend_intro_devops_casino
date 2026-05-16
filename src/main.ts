/**
 * main.ts — Punto de entrada de la aplicación
 *
 * Angular 17 usa "standalone components": no hay AppModule ni NgModule.
 * La configuración global (router, HTTP client, interceptors) se pasa
 * directamente a bootstrapApplication() como array de providers.
 *
 * provideRouter(rutas)
 *   Registra el Router con las rutas definidas en app.routes.ts.
 *   Incluye lazy loading automático vía loadComponent.
 *
 * provideHttpClient(withInterceptors([authInterceptor]))
 *   Registra el cliente HTTP de Angular y añade el interceptor que
 *   adjunta el JWT en cada petición saliente.
 */
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { AppComponent } from './app/app.component';
import { rutas } from './app/app.routes';
import { authInterceptor } from './app/interceptors/auth.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(rutas),
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
}).catch((err) => console.error(err));
