# Recetas — filtres fixos al header sticky

**Data:** 2026-07-21
**Àmbit:** `src/app/pages/recetas/` (`.html`, `.ts`, `.scss`)

## Context

Fa uns torns es va introduir `<app-page-header>`, un component compartit sticky
reutilitzat a `plantas`, `comunidad` i `recetas`, per evitar el "salt" del
header en fer scroll. Durant una fusió posterior (`dev` ← `tareas`), el commit
`16341ab "fix recetas"` va desfer accidentalment aquesta integració a
`recetas.html`: el cercador i les *dieta-chips* van tornar a un `<header>`
propi, no sticky, separat del `<app-page-header>`.

Mentrestant, `dev` també va afegir funcionalitat nova a Recetas que cal
conservar: filtres de categoria (`categoriaChips`) com a `mat-checkbox` amb
selecció múltiple independent, desglossament d'ingredients, i el pas de
`filteredRecipes`/`cargando` a `signal()`.

Aquest document especifica com reintegrar el sticky header a Recetas,
incorporant-hi també els filtres de dieta i categoria com a checkboxes.

## Objectiu

1. Recuperar el `<app-page-header>` sticky a `recetas.html` (títol + subtítol
   + contingut fix), igual que a `plantas` i `comunidad`.
2. Convertir els filtres de dieta (actualment botons pastilla exclusius) en
   checkboxes de selecció múltiple lliure, igual que els de categoria.
3. Encabir cercador + checkboxes de dieta + checkboxes de categoria dins del
   header sticky sense que aquest ocupi massa alçada de pantalla de manera
   permanent.

## Disseny aprovat (Opció B — filtres plegables)

Validat amb mockup interactiu (3 opcions comparades: tot visible / plegable /
xips en fila amb scroll). L'usuari ha triat **B**, amb un ajust: les
checkboxes de dieta sense emoji, en una sola fila.

**Estructura dins de `<app-page-header>` (`ng-content`):**

```
[ Recetas ]                          ← títol (input existent del component)
[ Basadas en tu huerto... ]          ← subtítol (input existent)
[ 🔍 Buscar recetas...          ]    ← cercador, sempre visible
[ Filtros (N)              ▾  ]     ← toggle, sempre visible
  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄  (només quan està obert)
  Dieta
  [ ] Omnívora  [ ] Vegetariana  [ ] Vegana      ← una fila, sense emoji
  Categoría
  [ ] Principales   [ ] Entrantes
  [ ] Guarniciones   [ ] Salsas
  [ ] Postres        [ ] Bebidas
```

- **Sempre visibles dins el sticky:** títol, subtítol, cercador, barra
  "Filtros (N)". Alçada aproximada equivalent a la resta de pàgines
  (~150px), sense "salt".
- **Panell plegable** (obert/tancat amb un signal `filtrosAbiertos`): conté
  les seccions "Dieta" i "Categoría", cadascuna amb la seva etiqueta
  (`section-label`, estil uppercase petit ja existent a `home.scss`/
  `page-header.scss` per coherència visual).
- El comptador `(N)` del botó "Filtros" suma
  `dietasActivas.size + categoriasActivas.size` perquè l'usuari vegi quants
  filtres té actius sense obrir el panell.
- Transició d'obertura amb `max-height` + `overflow:hidden` (CSS), sense
  llibreries d'animació noves.

## Comportament dels filtres de dieta (canvi funcional)

Actualment `dietaChips`/`dietasActivas` funcionen com un grup exclusiu:
marcar Vegana o Vegetariana neteja l'altra i Omnívora es "deriva" de tenir el
`Set` buit (`isDietaActiva()`), amb inclusió en cascada (Vegetariana també
mostra veganes).

**Nou comportament (aprovat):** selecció múltiple lliure, igual que
`categoriasActivas`:

- `dietasActivas: Set<TipoDieta>` (incloent explícitament `'OMNIVORA'` com a
  valor seleccionable, ja que `RecetaHuerto.tipo_dieta` pot valer
  `'OMNIVORA' | 'VEGETARIANA' | 'VEGANA'`).
- `toggleDieta(dieta)` afegeix/treu del `Set` de manera independent, sense
  casos especials ni exclusivitat (mateix patró que `toggleCategoria`).
- Filtre a `applyFilters()`: si `dietasActivas.size > 0`, es mostren només
  les receptes amb `tipo_dieta` dins del `Set` (coincidència OR, igual que ja
  fa el filtre de categoria); si està buit, es mostren totes.
- **Trencament de compatibilitat intencionat:** desapareix la inclusió en
  cascada (marcar Vegetariana ja no mostra també Veganes automàticament);
  ara cada checkbox filtra només pel seu valor exacte, exactament com
  Categoria. Coherent amb la decisió de l'usuari de tractar dieta igual que
  categoria.
- S'elimina `isDietaActiva()` (ja no cal, es fa servir `dietasActivas.has(...)`
  directament, igual que amb categories).
- Les etiquetes dels checkboxes de dieta van **sense emoji** ("Omnívora",
  "Vegetariana", "Vegana"); els emojis es mantenen només al subtítol
  (`getDietaText()`, que no es toca).

## Fitxers afectats

- `src/app/pages/recetas/recetas.html` — recupera `<app-page-header>`;
  reestructura el contingut projectat segons el nou disseny (cercador +
  toggle "Filtros" + panell amb dues seccions de checkboxes).
- `src/app/pages/recetas/recetas.ts` — `dietaChips` sense emoji als labels;
  `dietasActivas` passa a `Set<TipoDieta>` multi-select; nou signal
  `filtrosAbiertos`; `toggleDieta()` simplificat; `applyFilters()` actualitzat;
  s'elimina `isDietaActiva()`.
- `src/app/pages/recetas/recetas.scss` — nous estils per `.filters-toggle`,
  `.collapsible`, `.section-label`, fila de checkboxes de dieta sense graella;
  es netegen estils òrfens de l'antic `<header class="recetas-page__header">`.

## Fora d'abast

- No es toca `page-header.ts`/`page-header.scss` (el component compartit ja
  funciona igual que a `plantas`/`comunidad`).
- No es toquen els altres canvis fusionats de `dev` a Recetas (desglossament
  d'ingredients, `receta-window`, backend).
- No es migra la resta de la pàgina de `*ngFor`/`*ngIf` a `@for`/`@if` ni
  viceversa; es respecta l'estil ja present després del merge.

## Verificació

- `ng build` sense errors nous.
- Comprovació visual manual (o captura) que el header queda igual d'alt que
  `plantas`/`comunidad` quan el panell de filtres està tancat.
