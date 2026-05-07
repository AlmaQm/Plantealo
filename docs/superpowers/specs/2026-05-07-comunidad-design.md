# Comunidad Page — Design Spec
Date: 2026-05-07

## Overview

Página de comunidad estilo Instagram para jardinería y recetas. Feed de publicaciones con likes, comentarios, seguir usuarios y formulario para publicar. Implementación local con signal — preparada para sustituir por llamadas API cuando esté el backend.

## Archivos a crear / modificar

| Archivo | Acción |
|---|---|
| `src/app/models/interfaces.ts` | Añadir `Publicacion` y `Comentario` (sin borrar existentes) |
| `src/app/data/comunidad.data.ts` | Crear con ≥5 publicaciones de ejemplo |
| `src/app/shared/components/publicacion-card/publicacion-card.ts` | Crear |
| `src/app/shared/components/publicacion-card/publicacion-card.html` | Crear |
| `src/app/shared/components/publicacion-card/publicacion-card.scss` | Crear |
| `src/app/pages/comunidad/comunidad.ts` | Reescribir (stub vacío) |
| `src/app/pages/comunidad/comunidad.html` | Reescribir (stub vacío) |
| `src/app/pages/comunidad/comunidad.scss` | Crear |

## Interfaces

```typescript
export interface Comentario {
  comentario_id: number;
  usuario_id: number;
  nombre_usuario: string;
  username: string;
  texto: string;
  fecha: Date;
}

export interface Publicacion {
  publicacion_id: number;
  usuario_id: number;
  nombre_usuario: string;
  username: string;
  avatar_inicial: string;
  imagen_url: string;
  categoria: 'HUERTO' | 'RECETA' | 'CONSEJO' | 'COSECHA';
  descripcion: string;
  likes: number;
  liked: boolean;
  comentarios: Comentario[];
  fecha: Date;
  siguiendo: boolean;
}
```

## comunidad.data.ts

- Mínimo 5 publicaciones variadas: mezcla de HUERTO, RECETA, COSECHA, CONSEJO
- Usuarios ficticios con nombres en español y @username
- Algunas publicaciones con 1-3 comentarios, otras sin comentarios
- Fechas recientes (mayo 2026)
- Imágenes: usar rutas de `assets/images/` existentes (fotos de plantas y recetas)
- `liked: false` y `siguiendo: false` por defecto en todas

## PublicacionCardComponent

### Inputs
- `@Input() publicacion!: Publicacion`

### Estado local (signals)
- `liked = signal(publicacion.liked)` — inicializado con el valor del input
- `likes = signal(publicacion.likes)`
- `siguiendo = signal(publicacion.siguiendo)`
- `mostrarComentarios = signal(false)`
- `expandirDesc = signal(false)`
- `nuevoComentario = signal('')`
- `comentarios = signal([...publicacion.comentarios])`

### Métodos
- `toggleLike()` — invierte `liked`, suma/resta en `likes`
- `toggleSeguir()` — invierte `siguiendo`
- `toggleComentarios()` — invierte `mostrarComentarios`
- `enviarComentario()` — si `nuevoComentario()` no está vacío, añade al array local y resetea el campo
- `formatFecha(fecha: Date): string` — devuelve "22 mar", "3 abr", etc.

### Layout HTML (orden)

1. **Cabecera** (`publicacion-card__header`):
   - Avatar circular con `avatar_inicial` (letra) sobre fondo `$green-4`
   - `nombre_usuario` + `@username` (secundario)
   - Botón `Seguir` / `Siguiendo` (toggle, alineado a la derecha)

2. **Imagen** (`publicacion-card__imagen`):
   - `<img>` a ancho completo, altura 260px, `object-fit: cover`
   - Badge de categoría superpuesto arriba-izquierda

3. **Interacciones** (`publicacion-card__acciones`):
   - ❤️ `{{ likes() }}` — click hace toggle like (icono relleno si liked)
   - 💬 `{{ comentarios().length }}` — click toggle comentarios
   - Fecha alineada a la derecha

4. **Descripción** (`publicacion-card__desc`):
   - Clampeo a 2 líneas con `Ver más` / `Ver menos`

5. **Sección comentarios** (desplegable con animación `max-height`):
   - Lista de comentarios: avatar inicial + `@username` en negrita + texto
   - Campo `<input>` + botón Enviar para añadir comentario

### Badge colores por categoría
- `HUERTO`   → bg `$green-1`, text `$green-6`
- `RECETA`   → bg `$earth-1`, text `$earth-9`
- `CONSEJO`  → bg `#fef3c7`, text `#92400e`
- `COSECHA`  → bg `$green-2`, text `$green-7`

## comunidad.ts (página)

### Estado
- `feed = signal<Publicacion[]>(COMUNIDAD_DATA)` — cargado directamente del array
- `modalAbierto = signal(false)`
- `nuevaDesc = signal('')`
- `nuevaCategoria = signal<Publicacion['categoria']>('HUERTO')`
- `nuevaImagenUrl = signal('')`

### Métodos
- `abrirModal()` / `cerrarModal()` — reset campos al abrir
- `publicar()` — crea objeto `Publicacion` y hace `feed.update(f => [nueva, ...f])`; cierra modal
- La nueva publicación usa `usuario_id: 1`, `nombre_usuario: 'Tú'`, `username: '@mi_huerto'`, `avatar_inicial: 'T'`

### comunidad.html estructura
```
<div class="comunidad-page">
  <header>título + subtítulo + botón "+"</header>
  <div class="feed">
    @for (pub of feed(); track pub.publicacion_id) {
      <app-publicacion-card [publicacion]="pub" />
    }
  </div>
</div>
<button class="fab">+</button>
@if (modalAbierto()) { bottomsheet con formulario }
```

## comunidad.scss

- Fondo `$earth-1`, `min-height: 100vh`, `padding-bottom: 80px`
- Header: título `$green-7`, subtítulo `$green-5`
- Feed: `display: flex; flex-direction: column; gap: 16px; padding: 16px`
- Cards: `background: white; border-radius: 20px; overflow: hidden`
- FAB: igual que en plantas (`bottom: 124px`, `right: 20px`, `background: $green-6`)
- Bottomsheet: mismo patrón que plantas (posición fija, `slideUp` animation)

## publicacion-card.scss

- Fuente de avatar: `background: $green-4; color: white; border-radius: 50%`
- Botón Siguiendo: `background: $green-1; border: $green-3; color: $green-6`
- Botón Seguir: `background: $green-6; color: white`
- Corazón activo: `color: #e11d48` (rojo)
- Sección comentarios: misma animación `max-height` que `planta-card`
- Campo comentario: `border: 1.5px solid $green-3; border-radius: 20px`

## Notas backend

- `feed` en `signal` → cuando haya API, sustituir inicialización por llamada HTTP
- `enviarComentario` → cuando haya API, llamar POST endpoint antes de actualizar signal
- `toggleLike` / `toggleSeguir` → cuando haya API, llamar PATCH endpoint antes de actualizar signal
- La imagen en el formulario de publicar es un campo URL (no upload real) hasta que el backend tenga endpoint de subida
