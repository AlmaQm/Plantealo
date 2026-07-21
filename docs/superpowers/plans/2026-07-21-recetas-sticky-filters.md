# Recetas Sticky Filters Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reintegrate `<app-page-header>` (sticky) into `recetas.html`, and turn the diet filter into a free multi-select checkbox group living inside a collapsible "Filtros" panel alongside the existing category checkboxes.

**Architecture:** No new components. All changes stay inside the existing `RecetasComponent` (`recetas.html`/`.ts`/`.scss`). The sticky chrome (title, subtitle, search box, "Filtros (N)" toggle) is always rendered inside `<app-page-header>`'s `ng-content`; the diet + category checkboxes live in a sibling `div` whose `max-height` is toggled by a boolean signal, so no extra Angular component or animation library is needed.

**Tech Stack:** Angular standalone components, Angular Material `mat-checkbox` (already imported), Angular signals (zoneless app — state changes must go through `signal()`/`.set()`/`.update()` to trigger change detection, per the existing comment in `recetas.ts:27-29`).

## Global Constraints

- Diet checkbox labels must NOT include emojis (spec: "Omnívora", "Vegetariana", "Vegana" — plain text). The emoji in the subtitle (`getDietaText()`) is untouched.
- Diet filtering becomes free multi-select (OR match on `tipo_dieta`), matching the existing category filter pattern exactly — no exclusivity, no cascade inclusion.
- The always-visible part of the sticky header (title + subtitle + search + "Filtros" bar) must be roughly the same height as `plantas`/`comunidad`'s header — the checkboxes must NOT render unless the panel is open.
- Verification for this codebase is `ng build` (no working `ng test`/karma setup exists — confirmed no `karma.conf.js` in the repo). Do not treat `ng test` as a gate.
- Follow existing file conventions: keep `@for`/`@if` for the chip loops (already used that way in this file before this change), don't convert the unrelated `*ngFor`/`*ngIf` recipe-grid markup to the new control-flow syntax — that's out of scope.

---

### Task 1: `recetas.ts` — multi-select diet filter + panel-open state

**Files:**
- Modify: `src/app/pages/recetas/recetas.ts:36-40` (dietaChips labels), `:42` (dietasActivas init — unchanged type, just remove the special-casing later), `:69-82` (toggleDieta/isDietaActiva), `:86-99` (applyFilters)
- Test: `src/app/pages/recetas/recetas.spec.ts`

**Interfaces:**
- Produces (used by Task 2's template):
  - `dietaChips: { value: TipoDieta; label: string }[]` — same shape as before, emoji-free labels.
  - `dietasActivas: Set<TipoDieta>` — same field name, now free multi-select (no more implicit "empty set = Omnívora").
  - `toggleDieta(dieta: TipoDieta): void` — toggles membership, no special case.
  - `filtrosAbiertos: WritableSignal<boolean>` (via `signal(false)`) — read in template as `filtrosAbiertos()`.
  - `toggleFiltros(): void` — flips `filtrosAbiertos`.
  - `filtrosActivos(): number` — `dietasActivas.size + categoriasActivas.size`, for the "Filtros (N)" badge.
  - `isDietaActiva` is **removed** — Task 2's template calls `dietasActivas.has(chip.value)` directly, same as it already does for `categoriasActivas`.

- [ ] **Step 1: Update `dietaChips` labels (remove emojis) and reorder to match the approved mockup (Omnívora, Vegetariana, Vegana)**

Replace in `src/app/pages/recetas/recetas.ts`:

```typescript
  readonly dietaChips: { value: TipoDieta; label: string }[] = [
    { value: 'VEGETARIANA', label: '🥬 Vegetariana' },
    { value: 'VEGANA',      label: '🌱 Vegana'      },
    { value: 'OMNIVORA',    label: '🍖 Omnívora'    }
  ];
```

with:

```typescript
  readonly dietaChips: { value: TipoDieta; label: string }[] = [
    { value: 'OMNIVORA',    label: 'Omnívora'    },
    { value: 'VEGETARIANA', label: 'Vegetariana' },
    { value: 'VEGANA',      label: 'Vegana'      }
  ];
```

- [ ] **Step 2: Replace `toggleDieta`/`isDietaActiva` with free multi-select, matching `toggleCategoria`'s pattern**

Replace:

```typescript
  toggleDieta(dieta: TipoDieta): void {
    if (dieta === 'OMNIVORA') {
      // Omnívora = dieta libre: limpia cualquier filtro de dieta activo.
      this.dietasActivas = new Set();
      this.applyFilters();
      return;
    }
    // Vegetariana/Vegana son exclusivas entre sí y desmarcan Omnívora
    // automáticamente (Omnívora no se guarda en el Set, se deriva de que
    // esté vacío; ver isDietaActiva()).
    const yaActiva = this.dietasActivas.has(dieta);
    this.dietasActivas = new Set(yaActiva ? [] : [dieta]);
    this.applyFilters();
  }

  isDietaActiva(dieta: TipoDieta): boolean {
    return dieta === 'OMNIVORA' ? this.dietasActivas.size === 0 : this.dietasActivas.has(dieta);
  }
```

with:

```typescript
  toggleDieta(dieta: TipoDieta): void {
    // Selección múltiple libre, igual que toggleCategoria(): cada dieta se
    // marca/desmarca de forma independiente, sin exclusividad ni cascada.
    if (this.dietasActivas.has(dieta)) {
      this.dietasActivas.delete(dieta);
    } else {
      this.dietasActivas.add(dieta);
    }
    this.dietasActivas = new Set(this.dietasActivas);
    this.applyFilters();
  }
```

- [ ] **Step 3: Update `applyFilters()`'s diet block to OR-match on the active set**

Replace:

```typescript
    // Inclusión: Vegana ve solo veganas; Vegetariana ve vegetarianas + veganas;
    // sin dieta activa se ven todas (omnívoras, vegetarianas y veganas).
    if (this.dietasActivas.has('VEGANA')) {
      result = result.filter(r => r.tipo_dieta === 'VEGANA');
    } else if (this.dietasActivas.has('VEGETARIANA')) {
      result = result.filter(r => r.tipo_dieta === 'VEGETARIANA' || r.tipo_dieta === 'VEGANA');
    }
```

with:

```typescript
    // Selección múltiple libre: sin filtro activo se ven todas; con uno o
    // más marcados, solo las recetas cuyo tipo_dieta coincida con alguno
    // de los seleccionados (mismo patrón que categoriasActivas).
    if (this.dietasActivas.size > 0) {
      result = result.filter(r => this.dietasActivas.has(r.tipo_dieta as TipoDieta));
    }
```

- [ ] **Step 4: Add the "Filtros" panel-open state and active-filter counter**

Add these members right after `categoriasActivas = new Set<CategoriaFiltro>();` (around line 53):

```typescript
  // Panel plegable de filtros dentro del sticky header (dieta + categoría).
  readonly filtrosAbiertos = signal(false);
```

Add these methods right after `toggleCategoria` (after its closing brace, around line 67):

```typescript
  toggleFiltros(): void {
    this.filtrosAbiertos.update(v => !v);
  }

  filtrosActivos(): number {
    return this.dietasActivas.size + this.categoriasActivas.size;
  }
```

- [ ] **Step 5: Update the existing unit test to cover the new multi-select behavior**

Replace the full contents of `src/app/pages/recetas/recetas.spec.ts` with:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { RecetasComponent } from './recetas';

describe('RecetasComponent', () => {
  let component: RecetasComponent;
  let fixture: ComponentFixture<RecetasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecetasComponent],
      providers: [provideRouter([]), provideHttpClient()]
    }).compileComponents();

    fixture = TestBed.createComponent(RecetasComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('toggles diet filters independently (free multi-select)', () => {
    component.toggleDieta('VEGETARIANA');
    expect(component.dietasActivas.has('VEGETARIANA')).toBe(true);
    expect(component.dietasActivas.has('VEGANA')).toBe(false);

    component.toggleDieta('VEGANA');
    expect(component.dietasActivas.has('VEGETARIANA')).toBe(true);
    expect(component.dietasActivas.has('VEGANA')).toBe(true);

    component.toggleDieta('VEGETARIANA');
    expect(component.dietasActivas.has('VEGETARIANA')).toBe(false);
    expect(component.dietasActivas.has('VEGANA')).toBe(true);
  });

  it('counts active diet + category filters for the "Filtros" badge', () => {
    expect(component.filtrosActivos()).toBe(0);

    component.toggleDieta('OMNIVORA');
    component.toggleCategoria('POSTRE');
    expect(component.filtrosActivos()).toBe(2);
  });

  it('toggles the collapsible filters panel', () => {
    expect(component.filtrosAbiertos()).toBe(false);
    component.toggleFiltros();
    expect(component.filtrosAbiertos()).toBe(true);
    component.toggleFiltros();
    expect(component.filtrosAbiertos()).toBe(false);
  });
});
```

Note: this test file is written for completeness and future regression coverage. Since this repo has no working `ng test`/karma setup (no `karma.conf.js`), do NOT block this task on running it — the gate for this plan is `ng build` (Step 6 below covers the whole page, not just this file).

- [ ] **Step 6: Commit**

```bash
git add src/app/pages/recetas/recetas.ts src/app/pages/recetas/recetas.spec.ts
git commit -m "feat(recetas): dieta como selección múltiple libre, igual que categoría"
```

---

### Task 2: `recetas.html` — restore `<app-page-header>` with search + collapsible filters

**Files:**
- Modify: `src/app/pages/recetas/recetas.html:1-55` (everything from the opening `<div class="recetas-page">` down to the closing `</div>` of the old `__filters` block)

**Interfaces:**
- Consumes from Task 1: `dietaChips`, `dietasActivas.has(value)`, `toggleDieta(value)`, `categoriaChips`, `categoriasActivas.has(value)`, `toggleCategoria(value)`, `filtrosAbiertos()`, `toggleFiltros()`, `filtrosActivos()`, `searchTerm`, `onSearchChange()`, `getDietaText()` — all already exist or were added in Task 1.
- Consumes from the existing shared component: `<app-page-header [titulo] [subtitulo]>` with `ng-content` (see `src/app/shared/components/page-header/page-header.ts` and `.html` — already used identically in `plantas.html` and `comunidad.html`).
- Produces for Task 3: the class names `recetas-page__search`, `filters-toggle`, `filters-toggle--open`, `filters-toggle__count`, `filters-toggle__chev`, `recetas-page__filtros-collapse`, `recetas-page__filtros-collapse--open`, `recetas-page__filtros-panel`, `recetas-page__seccion-label`, `recetas-page__dieta-row`, `recetas-page__categoria-checkboxes` (this last one already exists in `recetas.scss`, reused).

- [ ] **Step 1: Replace lines 1-55 of `recetas.html`**

Current content (to be replaced — from the opening page `div` through the old `<div class="recetas-page__filters">...</div>` block, i.e. lines 1 through 55):

```html
<div class="recetas-page">

  <header class="recetas-page__header">
    <div>
      <h1 class="recetas-page__titulo">Recetas</h1>
      <p class="recetas-page__subtitulo">Basadas en tu huerto y preferencias {{ getDietaText() }}</p>
    </div>
  </header>
  
  <!-- <div class="recetas-page__search">
    <div class="search-box">
      <input 
        type="text" 
        [(ngModel)]="searchTerm" 
        (ngModelChange)="onSearchChange()"
        placeholder="Buscar recetas por nombre o ingredientes..."
        class="search-input">
      <span class="search-icon">🔍</span>
    </div>
  </div> -->
  
  <div class="recetas-page__dieta-chips">
    @for (chip of dietaChips; track chip.value) {
      <button
        class="dieta-chip"
        [class.active]="isDietaActiva(chip.value)"
        (click)="toggleDieta(chip.value)">
        {{ chip.label }}
      </button>
    }
  </div>

  <div class="recetas-page__categoria-checkboxes">
    @for (chip of categoriaChips; track chip.value) {
      <mat-checkbox
        color="primary"
        [checked]="categoriasActivas.has(chip.value)"
        (change)="toggleCategoria(chip.value)">
        {{ chip.label }}
      </mat-checkbox>
    }
  </div>

  <div class="recetas-page__filters">
    <div class="search-box">
      <input 
        type="text" 
        [(ngModel)]="searchTerm" 
        (ngModelChange)="onSearchChange()"
        placeholder="Buscar recetas..."
        class="search-input">
    </div>
    
    
  </div>
```

New content:

```html
<div class="recetas-page">

  <app-page-header
    [titulo]="'Recetas'"
    [subtitulo]="'Basadas en tu huerto y preferencias ' + getDietaText()">

    <div class="recetas-page__search">
      <div class="search-box">
        <input
          type="text"
          [(ngModel)]="searchTerm"
          (ngModelChange)="onSearchChange()"
          placeholder="Buscar recetas..."
          class="search-input">
      </div>
    </div>

    <button
      type="button"
      class="filters-toggle"
      [class.filters-toggle--open]="filtrosAbiertos()"
      (click)="toggleFiltros()">
      <span>
        Filtros
        @if (filtrosActivos() > 0) {
          <span class="filters-toggle__count">{{ filtrosActivos() }}</span>
        }
      </span>
      <span class="filters-toggle__chev">▾</span>
    </button>

    <div
      class="recetas-page__filtros-collapse"
      [class.recetas-page__filtros-collapse--open]="filtrosAbiertos()">
      <div class="recetas-page__filtros-panel">
        <div class="recetas-page__seccion-label">Dieta</div>
        <div class="recetas-page__dieta-row">
          @for (chip of dietaChips; track chip.value) {
            <mat-checkbox
              color="primary"
              [checked]="dietasActivas.has(chip.value)"
              (change)="toggleDieta(chip.value)">
              {{ chip.label }}
            </mat-checkbox>
          }
        </div>

        <div class="recetas-page__seccion-label">Categoría</div>
        <div class="recetas-page__categoria-checkboxes">
          @for (chip of categoriaChips; track chip.value) {
            <mat-checkbox
              color="primary"
              [checked]="categoriasActivas.has(chip.value)"
              (change)="toggleCategoria(chip.value)">
              {{ chip.label }}
            </mat-checkbox>
          }
        </div>
      </div>
    </div>
  </app-page-header>
```

Leave everything from the old line 57 (`<div *ngIf="cargando()" class="cargando">`) to the end of the file (old line 79) untouched.

- [ ] **Step 2: Verify the template compiles**

Run: `npx ng build 2>&1 | tail -n 20`
Expected: build succeeds (only the pre-existing budget/deprecation warnings, no new errors). If Angular complains about an unknown property/element, re-check that `<app-page-header>` is imported in `recetas.ts`'s `@Component.imports` array — it is not there yet, that's Task 3... actually no, add it now since the template needs it:

Check `src/app/pages/recetas/recetas.ts` line 18:

```typescript
  imports: [CommonModule, FormsModule, MatCheckboxModule, RecetaCardComponent, RecetaWindowComponent],
```

It's missing `PageHeaderComponent`. Add the import and the entry:

```typescript
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';
```

and:

```typescript
  imports: [CommonModule, FormsModule, MatCheckboxModule, PageHeaderComponent, RecetaCardComponent, RecetaWindowComponent],
```

- [ ] **Step 3: Run the build again to confirm it compiles**

Run: `npx ng build 2>&1 | tail -n 20`
Expected: build succeeds, output ends with `Output location: ...\dist\PlantealoApp`.

- [ ] **Step 4: Commit**

```bash
git add src/app/pages/recetas/recetas.html src/app/pages/recetas/recetas.ts
git commit -m "feat(recetas): mou cercador i filtres dins de l'app-page-header sticky"
```

---

### Task 3: `recetas.scss` — style the collapsible panel, clean up orphaned rules

**Files:**
- Modify: `src/app/pages/recetas/recetas.scss` (whole file — see exact replacements below)

**Interfaces:**
- Consumes: the class names produced by Task 2 (`recetas-page__search`, `filters-toggle` + modifiers, `recetas-page__filtros-collapse` + modifier, `recetas-page__filtros-panel`, `recetas-page__seccion-label`, `recetas-page__dieta-row`, `recetas-page__categoria-checkboxes`).
- Produces: nothing consumed by later tasks — this is the last task.

- [ ] **Step 1: Remove the orphaned `&__titulo`, `&__subtitulo`, `&__dieta-chips` rules and the standalone `.dieta-chip` block**

These styled the old non-sticky `<header>` and the old `<button class="dieta-chip">` markup, both removed in Task 2. Remove from `src/app/pages/recetas/recetas.scss`:

```scss
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
  
  &__dieta-chips {
    display: flex;
    gap: 8px;
    justify-content: center;
    margin-bottom: 20px;
  }
```

and, later in the same file:

```scss
.dieta-chip {
  padding: 6px 16px;
  border-radius: 20px;
  border: 1.5px solid $green-3;
  background: transparent;
  color: $green-6;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &.active {
    background: $green-6;
    border-color: $green-6;
    color: white;
  }

  &:not(.active):hover {
    background: $green-1;
  }
}
```

- [ ] **Step 2: Replace `&__categoria-checkboxes` (drop its own white background — it now lives inside `&__filtros-panel`) and `&__filters` (drop the unused `.filter-checkbox` sub-rule, keep only the search box, rename to `&__search`)**

Replace:

```scss
  &__categoria-checkboxes {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 4px 16px;
    justify-content: center;
    max-width: 480px;
    margin: 0 auto 20px;
    padding: 12px 16px;
    background: white;
    border-radius: 16px;
  }

  &__filters {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
    gap: 16px;
    flex-wrap: wrap;
    
    .search-box {
      flex: 1;
      min-width: 200px;
      
      .search-input {
        width: 100%;
        padding: 10px 16px;
        border: 2px solid $earth-1;
        border-radius: 24px;
        font-size: 14px;
        transition: all 0.2s ease;
        
        &:focus {
          outline: none;
          border-color: $green-4;
        }
      }
    }
    
    .filter-checkbox {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      
      input {
        width: 18px;
        height: 18px;
        cursor: pointer;
        accent-color: $green-5;
      }
      
      span {
        font-size: 14px;
        color: $green-6;
      }
    }
  }
```

with:

```scss
  &__search {
    margin-bottom: 8px;

    .search-box .search-input {
      width: 100%;
      padding: 10px 16px;
      border: 2px solid white;
      border-radius: 24px;
      font-size: 14px;
      background: white;
      transition: all 0.2s ease;
      box-sizing: border-box;

      &:focus {
        outline: none;
        border-color: $green-4;
      }
    }
  }

  &__filtros-collapse {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.25s ease;

    &--open {
      max-height: 400px;
      margin-top: 8px;
    }
  }

  &__filtros-panel {
    background: white;
    border-radius: 14px;
    padding: 10px 14px;
  }

  &__seccion-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: $green-5;
    margin: 8px 0 2px;

    &:first-child {
      margin-top: 0;
    }
  }

  &__dieta-row {
    display: flex;
    gap: 16px;
    flex-wrap: nowrap;
  }

  &__categoria-checkboxes {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 4px 16px;
  }
```

- [ ] **Step 3: Add the `.filters-toggle` bar styles (top-level, next to the removed `.dieta-chip` block)**

Add this at the same top-level nesting as `.loading-spinner` (i.e., outside the `.recetas-page { ... }` block):

```scss
.filters-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  background: white;
  border: none;
  border-radius: 20px;
  padding: 9px 14px;
  font-size: 13px;
  font-weight: 600;
  color: $green-7;
  cursor: pointer;
  font-family: inherit;

  &__count {
    background: $green-6;
    color: white;
    font-size: 11px;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 10px;
    margin-left: 6px;
  }

  &__chev {
    color: $green-5;
    transition: transform 0.2s ease;
  }

  &--open &__chev {
    transform: rotate(180deg);
  }
}
```

- [ ] **Step 4: Run the build to confirm the stylesheet compiles**

Run: `npx ng build 2>&1 | tail -n 20`
Expected: build succeeds, no new Sass errors (only the pre-existing `darken()`/budget warnings from unrelated files).

- [ ] **Step 5: Commit**

```bash
git add src/app/pages/recetas/recetas.scss
git commit -m "style(recetas): panell de filtres plegable dins del header sticky"
```

---

### Task 4: Manual visual verification

**Files:** none (verification only)

- [ ] **Step 1: Start the dev server**

Run: `npx ng serve`
Expected: compiles, serves on `http://localhost:4200/`.

- [ ] **Step 2: Open the Recetas page in a browser and check, against the approved mockup (Option B)**

- Header shows: title "Recetas", subtitle "Basadas en tu huerto y preferencias 🍖 Omnívora", the search box, and a "Filtros" bar — all with roughly the same total height as `/plantas` or `/comunidad`'s header when the panel is closed.
- Clicking "Filtros" expands a white panel below it with a "Dieta" section (Omnívora / Vegetariana / Vegana checkboxes, no emoji, in a single row) and a "Categoría" section (2-column checkbox grid) — no page layout jump/flash.
- Clicking "Filtros" again collapses the panel.
- Checking two diet boxes (e.g., Vegetariana + Vegana) shows recipes matching either — not just the intersection, and not clearing one when the other is picked.
- The "Filtros" label shows a count badge equal to the number of checked boxes (diet + category combined) once at least one is active, and no badge when none are active.
- Scrolling the recipe list down keeps the header (title/search/Filtros bar) pinned at the top, same sticky behavior as `/plantas` and `/comunidad`.

- [ ] **Step 3: Stop the dev server**

Press `Ctrl+C` in the terminal running `ng serve`.

- [ ] **Step 4: Push the branch**

```bash
git push origin feature/sticky-headers
```
