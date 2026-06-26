# casino-frontend

SPA Angular 17 (standalone components) del **Casino Online** —
Experiencia 2 de la asignatura **Introducción a Herramientas DevOps (ISY1101)**.

> **Este repositorio NO incluye `Dockerfile`, `docker-compose.yml`
> ni workflows de GitHub Actions.** Esos artefactos forman parte del
> entregable de la **Evaluación Parcial 2** y deben construirlos los
> estudiantes.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Angular 17 — standalone components, signals, lazy routes |
| Lenguaje | TypeScript 5.4 |
| Animaciones | GSAP 3, Three.js (WebGL) |
| Estilos | CSS puro (design system Monaco Royal) |
| Auth | JWT via HTTP interceptor |
| Build | Angular application builder (Vite + esbuild) |

---

## Estructura del proyecto

```
casino-frontend/
├── src/
│   ├── index.html                        ← punto de entrada HTML
│   ├── main.ts                           ← bootstrap standalone (sin NgModule)
│   ├── styles.css                        ← design system global (variables CSS)
│   ├── environments/
│   │   ├── environment.ts                ← dev: apiBaseUrl = http://localhost:3000
│   │   └── environment.prod.ts           ← prod: apiBaseUrl = '' (reverse proxy)
│   └── app/
│       ├── app.component.ts              ← shell: Three.js bg + router outlet
│       ├── app.routes.ts                 ← lazy loading de todos los componentes
│       ├── models/casino.models.ts       ← interfaces TypeScript compartidas
│       ├── utils/particles.ts            ← partículas Three.js al ganar
│       ├── services/
│       │   ├── auth.service.ts           ← signals: usuario, token, saldo
│       │   └── casino.service.ts         ← llamadas HTTP a la API REST
│       ├── interceptors/
│       │   └── auth.interceptor.ts       ← añade JWT a cada request HTTP
│       ├── guards/
│       │   └── auth.guard.ts             ← protege rutas privadas
│       └── components/
│           ├── three-background/         ← canvas WebGL fijo (fondo 3D)
│           ├── header/                   ← nav + saldo animado
│           ├── login/   register/
│           ├── lobby/                    ← catálogo de juegos
│           ├── slots/                    ← tragamonedas con GSAP
│           ├── roulette/                 ← ruleta SVG (37 segmentos europeos)
│           ├── blackjack/                ← cartas CSS + flip 3D
│           ├── profile/
│           └── history/
├── angular.json                          ← configuración del build
├── package.json
├── tsconfig.json
├── tsconfig.app.json
└── .gitignore
```

---

## Cómo funciona la app

### Autenticación
- El usuario se registra/loguea. El backend devuelve un **JWT**.
- `AuthService` guarda el token en `localStorage` usando Angular **signals**.
- `authInterceptor` adjunta automáticamente `Authorization: Bearer <token>`
  en cada petición HTTP saliente.
- `authGuard` redirige a `/login` si no hay sesión activa.
- Si el servidor responde con **401**, el interceptor cierra la sesión.

### Rutas protegidas
Todas las rutas de juego están protegidas por `authGuard`.
Usan **lazy loading** (`loadComponent`): cada juego se descarga como
chunk separado solo cuando el usuario navega a él.

### Comunicación con el backend
`CasinoService` y `AuthService` leen `environment.apiBaseUrl` para
construir las URLs. En **desarrollo** apunta a `localhost:3000`.
En **producción** es cadena vacía → rutas relativas → nginx reverse proxy.

---

## Variables de entorno y la estrategia de reverse proxy

`src/environments/environment.prod.ts` usa `apiBaseUrl: ''` (vacío).
Esto es **intencional**:

```
Navegador  →  /api/juegos  →  Nginx (mismo servidor)  →  Backend:3000
```

El JS del navegador llama a rutas relativas (`/api/...`). Nginx
recibe esas llamadas y las reenvía al backend mediante `proxy_pass`.

**¿Por qué no llamar directo al backend?**
- El Security Group del backend solo acepta tráfico del SG del frontend.
- Llamar desde el navegador activaría CORS (el origen del navegador
  es el IP del usuario, no del frontend EC2).
- El reverse proxy centraliza todo en un solo punto de entrada (puerto 80).

En **desarrollo local** (`environment.ts`) sí se usa `http://localhost:3000`
porque ambos procesos corren en la misma máquina.

---

## Correr en local (sin Docker)

Requisito: backend corriendo en `http://localhost:3000`.

```bash
npm install
npm start          # ng serve — http://localhost:4200
```

---

## Build de producción

```bash
npm run build      # ng build --configuration production
```

### Ruta de salida — IMPORTANTE para el Dockerfile

Angular 17 usa el nuevo **application builder** (Vite + esbuild).
El artefacto final queda en:

```
dist/
└── casino-frontend/
    └── browser/          ← aquí están los archivos estáticos (HTML, JS, CSS)
        ├── index.html
        ├── main-HASH.js
        └── chunk-HASH.js (uno por componente lazy)
```

> En el `COPY` del Dockerfile deben apuntar a
> `dist/casino-frontend/browser`, **no** a `dist/casino-frontend`.
> Con Angular < 17 era la carpeta raíz; desde la v17 con el nuevo
> builder hay una subcarpeta `browser/` extra.

---

## Lo que deben construir (EP2)

### 1. `Dockerfile` multi-stage

Deben escribir un Dockerfile que compile la SPA con Node y la sirva con Nginx.

Consideraciones clave:
- Usar un **build multi-stage** para no incluir `node_modules` en la imagen final.
- El comando de build es `npm run build` (ejecuta `ng build --configuration production`).
- **Angular 17 genera los archivos en `dist/casino-frontend/browser/`**, no en `dist/casino-frontend/`. Esta subcarpeta extra es nueva desde v17 con el application builder — es un error común al escribir el `COPY` del Dockerfile.
- El servidor web debe escuchar en el puerto 80.

### 2. Configuración de Nginx

Nginx debe cumplir dos funciones:
- **Servidor estático** para los archivos de la SPA.
- **Reverse proxy** para reenviar `/api/` al backend (puerto 3000).

Puntos críticos de la configuración:
- **SPA fallback**: Angular maneja el routing en el navegador. Si el usuario recarga la página directamente en `/lobby` o `/slots`, Nginx buscará un archivo con ese nombre, no lo encontrará y devolverá 404. Se necesita una directiva que sirva `index.html` como fallback para cualquier ruta que no corresponda a un archivo real.
- **Reverse proxy**: las llamadas a `/api/` deben reenviarse al backend. En `environment.prod.ts` el `apiBaseUrl` es cadena vacía, por lo que el JS del navegador hace llamadas relativas (`/api/juegos`, etc.) que Nginx intercepta y reenvía.

### 3. `docker-compose.yml`

Deben orquestar los servicios `db`, `casino-backend` y `casino-frontend` en una misma red interna, definiendo dependencias, puertos y variables de entorno necesarias.

### 4. Workflow CI/CD (`.github/workflows/deploy.yml`)

El workflow debe ejecutarse en push a la rama `deploy` y contemplar:
- Build y push de la imagen a un registry (Docker Hub o ECR).
- Deploy en la instancia EC2 vía SSH.

Lean la pauta oficial (`EP2_Instrucciones y Pauta_Encargo_Estudiante.pdf`) para los criterios de evaluación completos.

---

## Dependencias notables

| Paquete | Versión | Para qué se usa |
|---------|---------|-----------------|
| `@angular/core` | ^17.3 | Framework principal |
| `gsap` | ^3.15 | Animaciones UI (GSAP timelines, eases) |
| `three` | ^0.184 | Fondo WebGL con naipes 3D y partículas |
| `@types/three` | ^0.184 | TypeScript types para Three.js |
| `rxjs` | ~7.8 | Observables para HTTP y reactividad |
| `zone.js` | ~0.14 | Detección de cambios de Angular |

---

## Notas de arquitectura para la EP2

- **Standalone components**: no hay `NgModule`. La configuración global
  (router, HTTP client, interceptors) está en `main.ts` con `provideRouter`
  y `provideHttpClient`.
- **Signals**: `AuthService` usa `signal()` y `computed()` de Angular 17
  en lugar de `BehaviorSubject`. Los componentes leen los signals
  directamente en el template: `{{ auth.usuario()?.username }}`.
- **Lazy loading**: cada ruta carga su componente solo cuando se visita
  (`loadComponent`). Esto reduce el bundle inicial y mejora el LCP.
- **Three.js fuera de NgZone**: el loop de animación corre en
  `ngZone.runOutsideAngular()` para no disparar detección de cambios
  en cada frame de requestAnimationFrame.
