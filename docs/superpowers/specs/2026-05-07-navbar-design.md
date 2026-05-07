# Navbar Component — Design Spec
Date: 2026-05-07

## Overview

Bottom navigation bar fija para mobile. 4 ítems con icono arriba y texto abajo. El ítem activo muestra un fondo circular grisáceo detrás del icono.

## Archivos a modificar

| Archivo | Acción |
|---|---|
| `src/app/shared/navbar/navbar.ts` | Implementar (stub vacío existente) |
| `src/app/shared/navbar/navbar.html` | Implementar (stub vacío existente) |
| `src/app/shared/navbar/navbar.scss` | Implementar (stub vacío existente) |

`app.routes.ts` **no se toca** — las rutas de compañeras se añadirán via merge.

## Ítems de navegación

| Label | Ion-icon | RouterLink | Estado |
|---|---|---|---|
| Inicio | `home-outline` | `/inicio` | ruta pendiente (merge futuro) |
| Plantas | `leaf-outline` | `/plantas` | ruta pendiente (merge futuro) |
| Recetas | `restaurant-outline` | `/recetas` | ruta activa |
| Comunidad | `people-outline` | `/comunidad` | ruta pendiente (merge futuro) |

## navbar.ts

- Standalone component
- Imports: `RouterLink`, `RouterLinkActive` de `@angular/router`
- `schemas: [CUSTOM_ELEMENTS_SCHEMA]` para que Angular no rechace `<ion-icon>`

## navbar.html

Estructura de cada ítem:

```html
<nav class="navbar">
  <a routerLink="/recetas" routerLinkActive="active">
    <span class="icon-wrap">
      <ion-icon name="restaurant-outline"></ion-icon>
    </span>
    <span class="label">Recetas</span>
  </a>
  <!-- ... resto de ítems -->
</nav>
```

- El `<a>` recibe la clase `active` automáticamente via `routerLinkActive`
- `icon-wrap` es el contenedor del círculo grisáceo

## navbar.scss

### Layout
- `position: fixed; bottom: 0; left: 0; right: 0`
- `display: flex; justify-content: space-around; align-items: center`
- `background-color: var(--mat-sys-surface)`
- `padding: 8px 0` con `padding-bottom: env(safe-area-inset-bottom)` para notch de iPhone

### Cada ítem (`a`)
- `display: flex; flex-direction: column; align-items: center`
- `text-decoration: none`
- `color: var(--mat-sys-on-surface-variant)` (gris por defecto)

### Círculo del icono (`.icon-wrap`)
- `width: 40px; height: 40px; border-radius: 50%` — círculo perfecto
- `display: flex; align-items: center; justify-content: center`
- `transition: background-color 0.2s`

### Estado activo (`.active`)
- `.active .icon-wrap { background-color: var(--mat-sys-surface-variant) }`
- `.active .label { color: var(--mat-sys-primary) }`
- `.active ion-icon { color: var(--mat-sys-primary) }`

## Decisiones tomadas

- **Iconos**: `ion-icon` (Ionic Icons) — ya integrado via `IonicModule.forRoot()` en `app.config.ts`
- **Estado activo**: `routerLinkActive` nativo de Angular, sin lógica en el componente
- **Colores**: variables CSS de Angular Material (`--mat-sys-*`) para respetar el tema del proyecto
- **Rutas no registradas**: el navbar apunta a `/inicio`, `/plantas`, `/comunidad` aunque aún no están en `app.routes.ts`; se activarán tras el merge del equipo
