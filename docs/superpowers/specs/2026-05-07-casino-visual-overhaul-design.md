# Casino Frontend — Rediseño Visual Radical

**Fecha:** 2026-05-07  
**Stack:** Angular 17+ (standalone components)  
**Paquetes nuevos:** `gsap`, `three`, `@types/three`

---

## 1. Identidad visual — Monaco Royal

| Token | Valor |
|---|---|
| Fondo base | `#040d1c` → `#071524` (azul noche) |
| Acento primario | `#10b981` (esmeralda) |
| Acento dorado | `#d4af37` |
| Texto principal | `#e0f0e8` |
| Texto secundario | `#4a7a64` |
| Tarjetas | `rgba(6,14,26,0.85)` + borde `rgba(16,185,129,0.1)` |
| Border-radius | `14px` tarjetas · `8px` inputs · `999px` pills |
| Tipografía decorativa | Georgia, serif (títulos de juego, logo, montos) |
| Tipografía UI | Segoe UI, system-ui |

Sin emojis en ningún componente. Los iconos de juego se construyen con CSS y símbolos Unicode tipográficos (♠ ♥ ♦ ♣).

---

## 2. Paquetes a instalar

```bash
npm install gsap three @types/three
```

| Paquete | Tamaño | Uso |
|---|---|---|
| `gsap` | ~70 KB | Timelines, stagger, count-up, eases físicos en toda la UI |
| `three` | ~160 KB | Canvas WebGL para fondo de naipes 3D y partículas de victoria |
| `@types/three` | tipos | TypeScript types para Three.js |

---

## 3. Sistema global

### 3.1 Fondo Three.js — naipes 3D flotando
- Canvas WebGL fijo detrás de toda la app (z-index -1, position fixed)
- Crea ~30 objetos PlaneGeometry con textura de naipes (♠♥♦♣) que flotan en el espacio 3D con rotación y traslación aleatoria
- Parallax: la cámara rota ±15° según la posición del mouse (mousemove global)
- Color de fondo del renderer: `#040d1c`
- Servicio Angular singleton (`ThreeBackgroundService`) que inicializa en `AppComponent.ngOnInit` y destruye en `ngOnDestroy`

### 3.2 Logo — shimmer dorado
- CSS `background: linear-gradient(90deg, #b8902a, #f0d060, #d4af37, #f0d060, #b8902a)` con `background-size: 300%`
- `animation: shimmer 2.5s linear infinite` — desplaza `background-position`
- Sin JS, puro CSS en `header.component.ts`

### 3.3 Saldo — count-up animado
- Al recibir nuevo saldo (observable del `AuthService`), GSAP anima un objeto `{ val: valorAnterior }` hasta `{ val: valorNuevo }` en 400–800ms (proporcional al delta)
- El template muestra `{{ obj.val | number:'1.0-0' }}` usando `ChangeDetectorRef.markForCheck()` en cada tick del tween

### 3.4 Transiciones de ruta
- Animación de salida: `gsap.to(outletEl, { opacity: 0, y: -12, duration: 0.2 })`
- Animación de entrada: `gsap.fromTo(outletEl, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' })`
- Implementado con `Router.events` filtrando `NavigationStart` y `NavigationEnd` en `AppComponent`

---

## 4. Componentes — cambios por archivo

### 4.1 `styles.css` — sistema de diseño global
- Paleta Monaco Royal como variables CSS (`--color-bg`, `--color-emerald`, `--color-gold`, etc.)
- `.tarjeta` rediseñada: fondo oscuro azul, borde esmeralda sutil, sombra profunda
- `.btn-primario` pasa a gradiente esmeralda (`#0d7a56` → `#10b981`)
- `.btn-primario` dorado se convierte en `.btn-gold` para acciones de apuesta
- Inputs: borde esmeralda al focus con `box-shadow: 0 0 0 3px rgba(16,185,129,0.15)`
- `.titulo-juego`: Georgia serif, dorado, letter-spacing 3px

### 4.2 `header.component.ts`
- Logo con shimmer CSS
- Punto verde pulsante junto al saldo (CSS `animation: dot-pulse`)
- Saldo con count-up GSAP al cambiar
- Nav links: active state con fondo esmeralda translúcido y borde
- Backdrop-filter: `blur(14px)` en el header

### 4.3 `lobby.component.ts`
- Hero con eyebrow en mayúsculas esmeralda, nombre en gradiente dorado
- Saldo hero en pill con borde esmeralda
- Cards de juego: CSS 3D hover (perspectiva + rotateX/Y según posición del cursor via `mousemove`)
- Iconos de juego: CSS puro (rodillos para slots, SVG para ruleta, cartas CSS para blackjack)
- Esquinas decorativas doradas en cada card que se revelan al hover
- Entrada en cascada: GSAP `from({ opacity:0, y:20 })` con stagger 80ms en `ngAfterViewInit`

### 4.4 `slots.component.ts`
- Rodillos rediseñados: contenedor con gradiente superior/inferior que crea efecto de profundidad
- Línea de pago esmeralda horizontal en el centro de los rodillos
- Animación de giro: GSAP timeline por rodillo con `elastic.out(1, 0.4)` en la parada
- Parada en stagger de 250ms entre rodillo 1→2→3
- Victoria: overlay flash esmeralda (300ms) + partículas Three.js (40 unidades, 1.2s) + count-up del premio
- Sin emojis en los símbolos: usar 7, BAR, ♦, ♣, ♠, ★

### 4.5 `roulette.component.ts`
- Rueda SVG generada por JS con los 37 segmentos del orden europeo auténtico: `[0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26]`
- Colores exactos: rojo (`#7f1d1d`), negro (`#111827`), verde para 0 (`#14532d`)
- Números de cada color según estándar europeo
- Giro: GSAP rota la rueda calculando el ángulo final = posición del número ganador en la rueda. Ease `power4.out`, 3–5s
- Puntero dorado con vibración suave (`gsap.to` shakeX) mientras desacelera
- Historial: últimos 7 resultados, cada nuevo entra con slide-in desde la derecha (GSAP 250ms)
- Grilla de números 0–36 con colores reales para apostar por número

### 4.6 `blackjack.component.ts`
- Cartas rediseñadas: CSS puro — fondo blanco, tipografía Georgia, valores y palos con color correcto (rojo/negro)
- Cara trasera: gradiente azul marino `#1e3a8a → #1e40af`
- Reparto: cada carta vuela desde posición de "mazo" (transform desde arriba-centro) con GSAP `from({ x: 0, y: -100, rotation: -15, opacity: 0 })`, ease `back.out(1.5)`, stagger 150ms
- Reveal de carta oculta: CSS `rotateY` flip 3D en 600ms, ease `power2.inOut`
- Victoria: banner de resultado entra con `scale(0.8→1) + fade-in` (400ms) + partículas Three.js cayendo desde arriba con física de gravedad

### 4.7 `login.component.ts` y `register.component.ts`
- Card del formulario: entrada con `scale(0.95→1) + opacity(0→1)` en 500ms (GSAP)
- Campos en stagger de 60ms
- Glow esmeralda en inputs al focus (CSS global)

### 4.8 Componente nuevo: `three-background.component.ts`
- Componente standalone que monta el canvas Three.js
- Insertado en `app.component.ts` como primer hijo del layout
- `z-index: -1`, `position: fixed`, `pointer-events: none`
- Destruye el renderer en `ngOnDestroy` para evitar memory leaks

---

## 5. Plan de animaciones — resumen

| # | Animación | Componente | Librería | Duración | Trigger |
|---|---|---|---|---|---|
| 1 | Fondo naipes 3D flotando | Global | Three.js | Loop | App init |
| 2 | Shimmer dorado en logo | Header | CSS | 2.5s loop | Siempre |
| 3 | Count-up de saldo | Header | GSAP | 400–800ms | Resultado recibido |
| 4 | Transiciones de ruta | App | GSAP | 500ms | Router navigate |
| 5 | Entrada en cascada del lobby | Lobby | GSAP | 600ms | ngOnInit |
| 6 | Hover 3D en game cards | Lobby | CSS 3D + GSAP | 250ms | mousemove |
| 7 | Rodillos con física elástica | Slots | GSAP | 1.3s | Click Girar |
| 8 | Partículas de victoria | Slots / BJ | Three.js | 1.5s | premio > 0 |
| 9 | Rueda con desaceleración real | Roulette | GSAP | 3–5s | Click Girar |
| 10 | Slide-in de historial | Roulette | GSAP | 250ms | Resultado |
| 11 | Reparto de cartas desde mazo | Blackjack | GSAP | 400ms/carta | Repartir / Pedir |
| 12 | Flip 3D de carta oculta | Blackjack | CSS 3D + GSAP | 600ms | Plantarse |

---

## 6. Timeline de una partida de Slots

| Tiempo | Evento | Responsable |
|---|---|---|
| t = 0ms | Click en Girar | — |
| t = 0–80ms | Botón scale-down + ripple | CSS |
| t = 80ms | Los 3 rodillos comienzan a girar | GSAP |
| t = 800ms | Rodillo 1 frena con elastic.out | GSAP |
| t = 1050ms | Rodillo 2 frena | GSAP |
| t = 1300ms | Rodillo 3 frena — resultado visible | GSAP |
| t = 1350ms | Flash overlay esmeralda (si ganó) | CSS |
| t = 1500ms | 40 partículas de naipes salen del centro | Three.js |
| t = 1600ms | Saldo hace count-up al nuevo valor | GSAP |

---

## 7. Archivos a modificar

```
src/
  styles.css                          ← sistema de diseño completo
  app/
    app.component.ts                  ← Three.js init + transiciones de ruta
    components/
      header/header.component.ts      ← shimmer, saldo count-up
      lobby/lobby.component.ts        ← stagger entrada, hover 3D
      slots/slots.component.ts        ← rodillos GSAP, partículas
      roulette/roulette.component.ts  ← SVG rueda, giro GSAP
      blackjack/blackjack.component.ts← cartas CSS, deal + flip
      login/login.component.ts        ← entrada animada
      register/register.component.ts  ← entrada animada
```

## 8. Decisiones de arquitectura

- **Three.js se inicializa una sola vez** en `AppComponent` y el canvas es un elemento fijo del DOM. No se re-crea al navegar entre rutas.
- **GSAP no requiere módulo Angular** — se importa directamente en cada componente como `import { gsap } from 'gsap'`.
- **Las animaciones GSAP se matan en `ngOnDestroy`** de cada componente para evitar memory leaks (`gsap.killTweensOf(el)`).
- **El SVG de la ruleta se genera en `ngAfterViewInit`** con `document.createElementNS` para mantener el template de Angular limpio.
- **Sin emojis** en ningún template ni style. Iconos: CSS + Unicode tipográfico (♠♥♦♣, letras de carta, números).
