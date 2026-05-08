# Comunidad Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir la página Comunidad completa: feed estilo Instagram con publicaciones, likes, comentarios, seguir usuarios y formulario para publicar.

**Architecture:** El feed se carga desde un array local en un `signal<Publicacion[]>` en la página. `PublicacionCardComponent` es autosuficiente: gestiona su propio estado de like/seguir/comentarios con signals locales iniciados desde `@Input()` en `ngOnInit`. Sin servicio propio — preparado para sustituir por llamadas HTTP cuando haya backend.

**Tech Stack:** Angular 19 standalone, signals (`signal`, `WritableSignal`), `CommonModule`, `FormsModule`, SCSS con variables del proyecto (`src/styles/variables.scss`).

---

## Mapa de archivos

| Archivo | Acción |
|---|---|
| `src/app/models/interfaces.ts` | Añadir `Publicacion` + `Comentario` al final |
| `src/app/data/comunidad.data.ts` | Crear — 5 publicaciones de ejemplo |
| `src/app/shared/components/publicacion-card/publicacion-card.ts` | Crear |
| `src/app/shared/components/publicacion-card/publicacion-card.html` | Crear |
| `src/app/shared/components/publicacion-card/publicacion-card.scss` | Crear |
| `src/app/shared/components/publicacion-card/publicacion-card.spec.ts` | Crear |
| `src/app/pages/comunidad/comunidad.ts` | Reescribir (stub vacío) |
| `src/app/pages/comunidad/comunidad.html` | Reescribir (stub vacío) |
| `src/app/pages/comunidad/comunidad.scss` | Crear |

---

## Task 1: Interfaces + Data

**Files:**
- Modify: `src/app/models/interfaces.ts`
- Create: `src/app/data/comunidad.data.ts`

- [ ] **Step 1: Añadir interfaces al final de interfaces.ts**

Añadir al final de `src/app/models/interfaces.ts` (después de `GardenPlant`):

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

- [ ] **Step 2: Crear src/app/data/comunidad.data.ts**

```typescript
import { Publicacion } from '../models/interfaces';

export const COMUNIDAD_DATA: Publicacion[] = [
  {
    publicacion_id: 1,
    usuario_id: 2,
    nombre_usuario: 'Laura García',
    username: '@laura_garden',
    avatar_inicial: 'L',
    imagen_url: 'assets/images/tomate-cherry.jpg',
    categoria: 'HUERTO',
    descripcion: '¡Mis tomates cherry están listos para cosechar! Este año han salido increíbles, les he puesto compost casero y la diferencia se nota muchísimo.',
    likes: 23,
    liked: false,
    siguiendo: false,
    fecha: new Date('2026-05-06'),
    comentarios: [
      {
        comentario_id: 1,
        usuario_id: 3,
        nombre_usuario: 'Marc Puig',
        username: '@marc_vegetal',
        texto: '¡Qué bonitos! ¿Qué variedad usas?',
        fecha: new Date('2026-05-06')
      },
      {
        comentario_id: 2,
        usuario_id: 4,
        nombre_usuario: 'Ana Torres',
        username: '@ana_cocina',
        texto: 'Yo también uso compost y es una pasada la diferencia 🍅',
        fecha: new Date('2026-05-06')
      }
    ]
  },
  {
    publicacion_id: 2,
    usuario_id: 3,
    nombre_usuario: 'Marc Puig',
    username: '@marc_vegetal',
    avatar_inicial: 'M',
    imagen_url: 'assets/images/pesto.jpg',
    categoria: 'RECETA',
    descripcion: 'Pesto de albahaca con las hierbas de mi huerto. Sencillo, rápido y delicioso. Solo necesitas albahaca fresca, piñones, parmesano y buen aceite de oliva.',
    likes: 31,
    liked: false,
    siguiendo: false,
    fecha: new Date('2026-05-05'),
    comentarios: [
      {
        comentario_id: 3,
        usuario_id: 2,
        nombre_usuario: 'Laura García',
        username: '@laura_garden',
        texto: 'Tengo albahaca de sobra, ¡lo hago este finde!',
        fecha: new Date('2026-05-05')
      }
    ]
  },
  {
    publicacion_id: 3,
    usuario_id: 4,
    nombre_usuario: 'Ana Torres',
    username: '@ana_cocina',
    avatar_inicial: 'A',
    imagen_url: 'assets/images/lechuga.jpg',
    categoria: 'COSECHA',
    descripcion: 'Primera cosecha de lechugas del año 🥬 Han crecido en solo 6 semanas desde la siembra. El secreto: riego constante y sombra parcial en las horas de más calor.',
    likes: 47,
    liked: false,
    siguiendo: false,
    fecha: new Date('2026-05-04'),
    comentarios: []
  },
  {
    publicacion_id: 4,
    usuario_id: 5,
    nombre_usuario: 'Jordi Mas',
    username: '@jordi_huerto',
    avatar_inicial: 'J',
    imagen_url: 'assets/images/albahaca.jpg',
    categoria: 'CONSEJO',
    descripcion: 'Consejo del día: la albahaca no le gusta el frío. Si la tienes en exterior y bajan de 10°C por la noche, métela dentro. Un golpe de frío puede arruinar toda la planta en pocas horas.',
    likes: 15,
    liked: false,
    siguiendo: false,
    fecha: new Date('2026-05-03'),
    comentarios: [
      {
        comentario_id: 4,
        usuario_id: 2,
        nombre_usuario: 'Laura García',
        username: '@laura_garden',
        texto: 'Gracias, no lo sabía! La mía está fuera 😅',
        fecha: new Date('2026-05-03')
      },
      {
        comentario_id: 5,
        usuario_id: 4,
        nombre_usuario: 'Ana Torres',
        username: '@ana_cocina',
        texto: 'Muy buen consejo, yo aprendí a las malas 🥲',
        fecha: new Date('2026-05-03')
      }
    ]
  },
  {
    publicacion_id: 5,
    usuario_id: 6,
    nombre_usuario: 'Sara Vidal',
    username: '@sara_verde',
    avatar_inicial: 'S',
    imagen_url: 'assets/images/espinacas.jpg',
    categoria: 'HUERTO',
    descripcion: 'Huerto urbano en un balcón de 6m²! Con un poco de organización caben muchas más plantas de lo que parece. Esta temporada: espinacas, rúcula, cebollino, menta y perejil.',
    likes: 58,
    liked: false,
    siguiendo: false,
    fecha: new Date('2026-05-02'),
    comentarios: []
  }
];
```

- [ ] **Step 3: Verificar que compila**

```
ng build --configuration development 2>&1 | grep -i error
```

Esperado: sin errores de TypeScript.

- [ ] **Step 4: Commit**

```bash
git add src/app/models/interfaces.ts src/app/data/comunidad.data.ts
git commit -m "feat: add Publicacion/Comentario interfaces and comunidad sample data"
```

---

## Task 2: PublicacionCardComponent

**Files:**
- Create: `src/app/shared/components/publicacion-card/publicacion-card.ts`
- Create: `src/app/shared/components/publicacion-card/publicacion-card.html`
- Create: `src/app/shared/components/publicacion-card/publicacion-card.scss`
- Create: `src/app/shared/components/publicacion-card/publicacion-card.spec.ts`

- [ ] **Step 1: Escribir el test (spec) primero**

Crear `src/app/shared/components/publicacion-card/publicacion-card.spec.ts`:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PublicacionCardComponent } from './publicacion-card';
import { Publicacion } from '../../../models/interfaces';

const mockPublicacion: Publicacion = {
  publicacion_id: 1,
  usuario_id: 2,
  nombre_usuario: 'Test User',
  username: '@test',
  avatar_inicial: 'T',
  imagen_url: 'assets/test.jpg',
  categoria: 'HUERTO',
  descripcion: 'Descripción de prueba',
  likes: 5,
  liked: false,
  siguiendo: false,
  fecha: new Date('2026-05-01'),
  comentarios: []
};

describe('PublicacionCardComponent', () => {
  let component: PublicacionCardComponent;
  let fixture: ComponentFixture<PublicacionCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicacionCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PublicacionCardComponent);
    component = fixture.componentInstance;
    component.publicacion = mockPublicacion;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize likes from input', () => {
    expect(component.likes()).toBe(5);
  });

  it('should toggle like and update count', () => {
    component.toggleLike();
    expect(component.liked()).toBe(true);
    expect(component.likes()).toBe(6);
    component.toggleLike();
    expect(component.liked()).toBe(false);
    expect(component.likes()).toBe(5);
  });

  it('should toggle siguiendo', () => {
    component.toggleSeguir();
    expect(component.siguiendo()).toBe(true);
    component.toggleSeguir();
    expect(component.siguiendo()).toBe(false);
  });

  it('should add comment and clear field', () => {
    component.nuevoComentario.set('Hola!');
    component.enviarComentario();
    expect(component.comentarios().length).toBe(1);
    expect(component.nuevoComentario()).toBe('');
  });

  it('should not add empty comment', () => {
    component.nuevoComentario.set('  ');
    component.enviarComentario();
    expect(component.comentarios().length).toBe(0);
  });
});
```

- [ ] **Step 2: Ejecutar tests para verificar que fallan**

```
ng test --watch=false
```

Esperado: fallos por `PublicacionCardComponent` no encontrado.

- [ ] **Step 3: Implementar publicacion-card.ts**

Crear `src/app/shared/components/publicacion-card/publicacion-card.ts`:

```typescript
import { Component, Input, OnInit, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Publicacion, Comentario } from '../../../models/interfaces';

@Component({
  selector: 'app-publicacion-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './publicacion-card.html',
  styleUrls: ['./publicacion-card.scss']
})
export class PublicacionCardComponent implements OnInit {
  @Input() publicacion!: Publicacion;

  liked!: WritableSignal<boolean>;
  likes!: WritableSignal<number>;
  siguiendo!: WritableSignal<boolean>;
  comentarios!: WritableSignal<Comentario[]>;
  mostrarComentarios = signal(false);
  expandirDesc = signal(false);
  nuevoComentario = signal('');

  ngOnInit(): void {
    this.liked = signal(this.publicacion.liked);
    this.likes = signal(this.publicacion.likes);
    this.siguiendo = signal(this.publicacion.siguiendo);
    this.comentarios = signal([...this.publicacion.comentarios]);
  }

  toggleLike(): void {
    this.liked.update(v => !v);
    this.likes.update(n => this.liked() ? n + 1 : n - 1);
  }

  toggleSeguir(): void {
    this.siguiendo.update(v => !v);
  }

  toggleComentarios(): void {
    this.mostrarComentarios.update(v => !v);
  }

  enviarComentario(): void {
    const texto = this.nuevoComentario().trim();
    if (!texto) return;
    const nuevo: Comentario = {
      comentario_id: Date.now(),
      usuario_id: 1,
      nombre_usuario: 'Tú',
      username: '@mi_huerto',
      texto,
      fecha: new Date()
    };
    this.comentarios.update(list => [...list, nuevo]);
    this.nuevoComentario.set('');
  }

  formatFecha(fecha: Date): string {
    return new Date(fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }

  getCategoriaLabel(): string {
    const map: Record<Publicacion['categoria'], string> = {
      'HUERTO': '🌿 Huerto', 'RECETA': '🍳 Receta',
      'CONSEJO': '💡 Consejo', 'COSECHA': '🌾 Cosecha'
    };
    return map[this.publicacion.categoria];
  }
}
```

- [ ] **Step 4: Implementar publicacion-card.html**

Crear `src/app/shared/components/publicacion-card/publicacion-card.html`:

```html
<div class="pub-card">

  <!-- Cabecera -->
  <div class="pub-card__header">
    <div class="pub-card__avatar">{{ publicacion.avatar_inicial }}</div>
    <div class="pub-card__user">
      <span class="pub-card__nombre">{{ publicacion.nombre_usuario }}</span>
      <span class="pub-card__username">{{ publicacion.username }}</span>
    </div>
    <button class="pub-card__seguir" [class.siguiendo]="siguiendo()" (click)="toggleSeguir()">
      {{ siguiendo() ? 'Siguiendo' : 'Seguir' }}
    </button>
  </div>

  <!-- Imagen con badge -->
  <div class="pub-card__imagen-wrap">
    <img class="pub-card__imagen"
         [src]="publicacion.imagen_url"
         [alt]="publicacion.descripcion"
         (error)="$any($event.target).src='assets/images/placeholder-receta.jpg'">
    <span class="pub-card__badge categoria--{{ publicacion.categoria | lowercase }}">
      {{ getCategoriaLabel() }}
    </span>
  </div>

  <!-- Interacciones -->
  <div class="pub-card__acciones">
    <button class="accion-btn" [class.liked]="liked()" (click)="toggleLike()">
      {{ liked() ? '❤️' : '🤍' }} {{ likes() }}
    </button>
    <button class="accion-btn" (click)="toggleComentarios()">
      💬 {{ comentarios().length }}
    </button>
    <span class="pub-card__fecha">{{ formatFecha(publicacion.fecha) }}</span>
  </div>

  <!-- Descripción -->
  <div class="pub-card__desc" [class.expandida]="expandirDesc()">
    <p>{{ publicacion.descripcion }}</p>
    @if (!expandirDesc()) {
      <button class="ver-mas" (click)="expandirDesc.set(true)">Ver más</button>
    } @else {
      <button class="ver-mas" (click)="expandirDesc.set(false)">Ver menos</button>
    }
  </div>

  <!-- Comentarios desplegables -->
  <div class="pub-card__comentarios" [class.open]="mostrarComentarios()">
    @if (comentarios().length > 0) {
      <div class="comentario-lista">
        @for (c of comentarios(); track c.comentario_id) {
          <div class="comentario">
            <span class="comentario__avatar">{{ c.nombre_usuario[0] }}</span>
            <div class="comentario__body">
              <span class="comentario__username">{{ c.username }}</span>
              <span class="comentario__texto">{{ c.texto }}</span>
            </div>
          </div>
        }
      </div>
    }
    <div class="comentario-input">
      <input
        type="text"
        placeholder="Añade un comentario..."
        [ngModel]="nuevoComentario()"
        (ngModelChange)="nuevoComentario.set($event)"
        (keyup.enter)="enviarComentario()">
      <button (click)="enviarComentario()" [disabled]="!nuevoComentario().trim()">
        Enviar
      </button>
    </div>
  </div>

  <!-- Toggle comentarios -->
  <button class="pub-card__ver-comentarios" (click)="toggleComentarios()">
    @if (!mostrarComentarios()) {
      Ver {{ comentarios().length }} comentario{{ comentarios().length !== 1 ? 's' : '' }}
    } @else {
      Ocultar comentarios
    }
  </button>

</div>
```

- [ ] **Step 5: Implementar publicacion-card.scss**

Crear `src/app/shared/components/publicacion-card/publicacion-card.scss`:

```scss
@import '../../../../styles/variables';

.pub-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  &__header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
  }

  &__avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: $green-4;
    color: white;
    font-weight: 700;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__user {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  &__nombre {
    font-size: 14px;
    font-weight: 600;
    color: $green-7;
  }

  &__username {
    font-size: 12px;
    color: $green-5;
  }

  &__seguir {
    padding: 5px 14px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    border: 1.5px solid $green-3;
    background: $green-6;
    color: white;
    transition: all 0.2s ease;
    flex-shrink: 0;

    &.siguiendo {
      background: $green-1;
      border-color: $green-3;
      color: $green-6;
    }
  }

  &__imagen-wrap {
    position: relative;
  }

  &__imagen {
    display: block;
    width: 100%;
    height: 260px;
    object-fit: cover;
  }

  &__badge {
    position: absolute;
    top: 10px;
    left: 10px;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;

    &.categoria--huerto  { background: $green-1; color: $green-6; }
    &.categoria--receta  { background: $earth-1; color: $earth-9; }
    &.categoria--consejo { background: #fef3c7;  color: #92400e; }
    &.categoria--cosecha { background: $green-2; color: $green-7; }
  }

  &__acciones {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 10px 14px 6px;
  }

  &__fecha {
    margin-left: auto;
    font-size: 11px;
    color: $green-5;
  }

  &__desc {
    padding: 0 14px 8px;
    position: relative;

    p {
      font-size: 13px;
      color: $green-7;
      line-height: 1.5;
      margin: 0 0 2px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    &.expandida p {
      -webkit-line-clamp: unset;
      overflow: visible;
    }
  }

  &__comentarios {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;
    padding: 0 14px;

    &.open {
      max-height: 600px;
      padding: 4px 14px 8px;
    }
  }

  &__ver-comentarios {
    display: block;
    width: 100%;
    padding: 8px 14px;
    background: none;
    border: none;
    border-top: 1px solid $earth-1;
    font-size: 12px;
    color: $green-5;
    cursor: pointer;
    text-align: left;

    &:hover { color: $green-6; }
  }
}

.accion-btn {
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  color: $green-6;
  transition: background 0.15s;

  &:hover { background: $green-1; }
  &.liked { color: #e11d48; }
}

.ver-mas {
  background: none;
  border: none;
  font-size: 12px;
  color: $green-5;
  cursor: pointer;
  padding: 0;

  &:hover { color: $green-6; }
}

.comentario-lista {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 10px;
}

.comentario {
  display: flex;
  gap: 8px;
  align-items: flex-start;

  &__avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: $green-3;
    color: $green-7;
    font-weight: 700;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__body {
    font-size: 13px;
    line-height: 1.4;
  }

  &__username {
    font-weight: 600;
    color: $green-6;
    margin-right: 4px;
  }

  &__texto { color: $green-7; }
}

.comentario-input {
  display: flex;
  gap: 8px;
  border-top: 1px solid $earth-1;
  padding-top: 8px;

  input {
    flex: 1;
    padding: 8px 12px;
    border: 1.5px solid $green-3;
    border-radius: 20px;
    font-size: 13px;
    outline: none;
    color: $green-7;

    &:focus { border-color: $green-5; }
  }

  button {
    padding: 8px 14px;
    background: $green-6;
    color: white;
    border: none;
    border-radius: 20px;
    font-size: 13px;
    cursor: pointer;

    &:disabled { background: $green-3; cursor: not-allowed; }
  }
}
```

- [ ] **Step 6: Ejecutar tests para verificar que pasan**

```
ng test --watch=false
```

Esperado: todos los tests del nuevo spec pasan (6 tests de `PublicacionCardComponent`).

- [ ] **Step 7: Commit**

```bash
git add src/app/shared/components/publicacion-card/
git commit -m "feat: implement PublicacionCardComponent with likes, comments and follow"
```

---

## Task 3: Página Comunidad

**Files:**
- Modify: `src/app/pages/comunidad/comunidad.ts`
- Modify: `src/app/pages/comunidad/comunidad.html`
- Create: `src/app/pages/comunidad/comunidad.scss`

- [ ] **Step 1: Implementar comunidad.ts**

Contenido completo de `src/app/pages/comunidad/comunidad.ts`:

```typescript
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PublicacionCardComponent } from '../../shared/components/publicacion-card/publicacion-card';
import { Publicacion } from '../../models/interfaces';
import { COMUNIDAD_DATA } from '../../data/comunidad.data';

@Component({
  selector: 'app-comunidad',
  standalone: true,
  imports: [CommonModule, FormsModule, PublicacionCardComponent],
  templateUrl: './comunidad.html',
  styleUrl: './comunidad.scss'
})
export class Comunidad {

  feed = signal<Publicacion[]>([...COMUNIDAD_DATA]);
  modalAbierto = signal(false);

  nuevaDesc = signal('');
  nuevaCategoria = signal<Publicacion['categoria']>('HUERTO');
  nuevaImagenUrl = signal('');

  readonly categorias: Publicacion['categoria'][] = ['HUERTO', 'RECETA', 'CONSEJO', 'COSECHA'];

  abrirModal(): void {
    this.nuevaDesc.set('');
    this.nuevaCategoria.set('HUERTO');
    this.nuevaImagenUrl.set('');
    this.modalAbierto.set(true);
  }

  cerrarModal(): void {
    this.modalAbierto.set(false);
  }

  publicar(): void {
    const desc = this.nuevaDesc().trim();
    if (!desc) return;

    const nueva: Publicacion = {
      publicacion_id: Date.now(),
      usuario_id: 1,
      nombre_usuario: 'Tú',
      username: '@mi_huerto',
      avatar_inicial: 'T',
      imagen_url: this.nuevaImagenUrl().trim() || 'assets/images/placeholder-receta.jpg',
      categoria: this.nuevaCategoria(),
      descripcion: desc,
      likes: 0,
      liked: false,
      comentarios: [],
      fecha: new Date(),
      siguiendo: false
    };

    this.feed.update(f => [nueva, ...f]);
    this.cerrarModal();
  }
}
```

- [ ] **Step 2: Implementar comunidad.html**

Contenido completo de `src/app/pages/comunidad/comunidad.html`:

```html
<div class="comunidad-page">

  <header class="comunidad-page__header">
    <div>
      <h1 class="comunidad-page__titulo">Comunidad</h1>
      <p class="comunidad-page__subtitulo">Comparte y descubre con otros jardineros</p>
    </div>
  </header>

  <div class="comunidad-page__feed">
    @for (pub of feed(); track pub.publicacion_id) {
      <app-publicacion-card [publicacion]="pub" />
    }
  </div>

</div>

<!-- FAB -->
<button class="fab" (click)="abrirModal()" aria-label="Nueva publicación">+</button>

<!-- Overlay + Bottomsheet -->
@if (modalAbierto()) {
  <div class="modal-overlay" (click)="cerrarModal()"></div>
  <div class="bottomsheet">
    <div class="bottomsheet__handle"></div>

    <div class="bottomsheet__header">
      <h3 class="bottomsheet__titulo">Nueva publicación</h3>
      <button class="bottomsheet__cerrar" (click)="cerrarModal()">✕</button>
    </div>

    <div class="bottomsheet__body">

      <label class="campo-label">Categoría</label>
      <div class="categoria-toggle">
        @for (cat of categorias; track cat) {
          <button
            class="cat-btn"
            [class.active]="nuevaCategoria() === cat"
            (click)="nuevaCategoria.set(cat)">
            {{ cat === 'HUERTO' ? '🌿' : cat === 'RECETA' ? '🍳' : cat === 'CONSEJO' ? '💡' : '🌾' }}
            {{ cat | titlecase }}
          </button>
        }
      </div>

      <label class="campo-label" style="margin-top:14px">Descripción</label>
      <textarea
        class="campo-textarea"
        placeholder="¿Qué quieres compartir?"
        rows="3"
        [ngModel]="nuevaDesc()"
        (ngModelChange)="nuevaDesc.set($event)">
      </textarea>

      <label class="campo-label" style="margin-top:14px">URL de imagen (opcional)</label>
      <input
        type="url"
        class="campo-input"
        placeholder="https://..."
        [ngModel]="nuevaImagenUrl()"
        (ngModelChange)="nuevaImagenUrl.set($event)">

    </div>

    <div class="bottomsheet__footer">
      <button class="btn-cancelar" (click)="cerrarModal()">Cancelar</button>
      <button class="btn-publicar" [disabled]="!nuevaDesc().trim()" (click)="publicar()">
        Publicar
      </button>
    </div>
  </div>
}
```

- [ ] **Step 3: Implementar comunidad.scss**

Crear `src/app/pages/comunidad/comunidad.scss`:

```scss
@import '../../../styles/variables';

.comunidad-page {
  min-height: 100vh;
  background-color: $earth-1;
  padding: 0 0 80px;

  &__header {
    padding: 24px 16px 16px;
  }

  &__titulo {
    font-size: 28px;
    font-weight: 700;
    color: $green-7;
    margin: 0 0 2px;
  }

  &__subtitulo {
    font-size: 13px;
    color: $green-5;
    margin: 0;
  }

  &__feed {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 0 16px;
  }
}

// FAB
.fab {
  position: fixed;
  bottom: 124px;
  right: 20px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: $green-6;
  color: white;
  font-size: 28px;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease, transform 0.15s ease;

  &:hover  { background: $green-7; transform: scale(1.08); }
  &:active { transform: scale(0.95); }
}

// Overlay + Bottomsheet (mismo patrón que plantas)
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 200;
  animation: fadeIn 0.2s ease;
}

.bottomsheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-radius: 20px 20px 0 0;
  z-index: 201;
  padding: 12px 20px 32px;
  animation: slideUp 0.28s ease;
  max-height: 90vh;
  overflow-y: auto;

  &__handle {
    width: 40px;
    height: 4px;
    background: #ddd;
    border-radius: 2px;
    margin: 0 auto 16px;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  &__titulo {
    font-size: 17px;
    font-weight: 700;
    color: $green-7;
    margin: 0;
  }

  &__cerrar {
    background: none;
    border: none;
    font-size: 18px;
    color: $green-5;
    cursor: pointer;
  }

  &__body { margin-bottom: 20px; }

  &__footer {
    display: flex;
    gap: 10px;
  }
}

.campo-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: $green-6;
  margin-bottom: 8px;
}

.campo-textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid $green-3;
  border-radius: 12px;
  font-size: 14px;
  color: $green-7;
  resize: none;
  font-family: inherit;

  &:focus { outline: none; border-color: $green-5; }
}

.campo-input {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid $green-3;
  border-radius: 12px;
  font-size: 14px;
  color: $green-7;

  &:focus { outline: none; border-color: $green-5; }
}

.categoria-toggle {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.cat-btn {
  padding: 6px 12px;
  border-radius: 20px;
  border: 1.5px solid $green-3;
  background: transparent;
  color: $green-6;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s ease;

  &.active  { background: $green-6; border-color: $green-6; color: white; }
  &:hover:not(.active) { background: $green-1; }
}

.btn-cancelar {
  flex: 1;
  padding: 13px;
  border-radius: 12px;
  border: 1.5px solid $green-3;
  background: transparent;
  color: $green-6;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
}

.btn-publicar {
  flex: 2;
  padding: 13px;
  border-radius: 12px;
  border: none;
  background: $green-6;
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;

  &:disabled { background: $green-3; cursor: not-allowed; }
  &:not(:disabled):hover { background: $green-7; }
}

@keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
```

- [ ] **Step 4: Ejecutar tests**

```
ng test --watch=false
```

Esperado: todos los tests pasan (19 existentes + 6 nuevos de publicacion-card = 25 total).

- [ ] **Step 5: Commit**

```bash
git add src/app/pages/comunidad/ src/app/shared/components/publicacion-card/
git commit -m "feat: implement comunidad page with feed, likes, comments and publish form"
```
