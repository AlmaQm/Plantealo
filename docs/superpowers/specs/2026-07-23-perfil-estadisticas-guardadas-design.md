# Perfil: reskin Model D, Estadísticas interactives i Guardadas

**Data:** 2026-07-23
**Branca:** `feature/perfil-estadisticas`
**Àmbit:** `src/app/pages/perfil/`, nova pàgina `src/app/pages/plantas-historial/`, `src/app/shared/components/publicacion-card/`, `src/app/services/comunidad.ts`, `backend/` (models/schemas/crud/main).

## Context

Perfil (`src/app/pages/perfil/`) fa servir avui l'estil verd/blanc original de l'app: targeta principal (avatar+nom+dieta amb emoji), targeta "Información Personal", targeta "Estadísticas del Huerto" (3 números en degradat verd) i un `menu-group` amb 3 botons purament visuals (Notificaciones/Seguridad/Configuración, amb emoji, sense `(click)`).

Aquest document especifica com estendre-hi el disseny "Model D" que ja fa servir `home.html`/`home.scss` ($md-bg, $md-ink, $md-ink-muted, $md-accent, $md-font — vegeu `src/styles/model-d-home.scss`), i com afegir dues funcionalitats noves: una pàgina d'historial de plantes i una secció "Guardadas" amb receptes i publicacions.

Validat amb mockup interactiu (Artifact) i tres rondes de preguntes d'aclariment amb l'usuari.

## Decisions aprovades

1. **Reskin complet de Perfil a Model D** — no només els elements nous; tota la pàgina (avatar, info, stats, menu, logout).
2. **"Plantas gestionadas"** (4a estadística) mostra el mateix valor que "Plantas" (`totalPlantas()`) — no hi ha historial d'esborrades encara; és intencionat que coincideixin avui.
3. **Estadísticas del Huerto** passa a graella 2×2 (4 valors) i **tota la targeta és clicable**, navegant a `/plantas-historial` (llista completa, sense filtrar per estat).
4. **Sense emojis** al menu Notificaciones/Seguridad/Configuración (SVG inline, estil Lucide com ja fa `planta-card.html`) ni al camp `tipo_dieta` (text pla, sense cap icona). **Abast limitat a aquesta branca**: la resta de l'app (receta-card, publicacion-card, badges de dieta/categoria, etc.) es queda amb emoji per ara — és una feature separada, no en aquest abast.
5. **Guardadas**: nova secció a Perfil amb 2 tabs, "Recetas" i "Posts".
   - Tab Recetas crida `RecetasService.getRecetasGuardadas()` (ja existeix).
   - Tab Posts crida un endpoint nou (no existia cap mecanisme de "guardar" publicacions, només "like") — cal crear-lo de cap a cap: taula, schemas, crud, endpoints, servei frontend i botó nou (bookmark, SVG, diferent del cor de like) a `publicacion-card`.
   - "Ver todas" de Recetas obre `/recetas` tal qual; de Posts obre `/comunidad` tal qual. Sense pàgina dedicada de "totes les guardades" en aquesta fase.

## Blocs de treball

### Bloc A — Perfil: reskin Model D + Estadísticas clicables

**Fitxers:**
- Modificar: `src/app/pages/perfil/perfil.ts`, `perfil.html`, `perfil.scss`

**Canvis:**
- `perfil.scss`: reemplaça `@use 'styles/variables'` per `@use 'styles/model-d-home' as *`; recolora totes les targetes (`$green-*`/`$earth-*` → `$md-*`); la targeta de stats passa de gradient verd a fons sòlid `$md-accent` + text `$md-on-accent`; els títols de secció ("Información Personal", "Estadísticas del Huerto", etc.) adopten l'estil `.zone-label` (`font-size: 0.68rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: $md-ink-muted`).
- `perfil.ts`: `DIETA_LABEL` perd els emojis (només text: "Omnívora", "Vegetariana", "Vegana"); s'injecta `Router` i s'afegeix `irAHistorialPlantas(): void { this.router.navigate(['/plantas-historial']); }`.
- `perfil.html`: graella d'stats `2×2` amb el 4t valor "Gestionadas" (`{{ totalPlantas() }}`, mateix valor que "Plantas"); tota la targeta `card--stats` porta `(click)="irAHistorialPlantas()"` i `role="button"`/`tabindex="0"` per accessibilitat de teclat; el `tag` de dieta ja no porta cap icona (`{{ dietaLabel(...) }}` a seques); els 3 botons del `menu-group` incorporen SVG inline (campana, cadenat, engranatge) en lloc de l'emoji, sense afegir encara `(click)` funcional (continuen sent visuals, com ara — fora d'abast fer-los funcionar).
- La ruta `/plantas-historial` encara no existeix (es crea al Bloc B); és esperat que la navegació no resolgui res fins llavors.

**Verificació:** `ng build` sense errors nous; captura/inspecció visual comparant amb el mockup Model D aprovat.

### Bloc B — Nova pàgina "Historial de plantas"

**Fitxers:**
- Crear: `src/app/pages/plantas-historial/plantas-historial.ts`, `.html`, `.scss`
- Modificar: `src/app/app.routes.ts` (ruta plana nova, `path: 'plantas-historial'`, `canActivate: [authGuard]`, seguint el mateix patró que la resta de rutes)

**Contingut (Fase 1):** llista simple de `plantasService.inventario()` amb nom, estat (`calcularEstado()`), `f_siembra` i `f_recogida`/`f_cosecha`. Sense agrupacions, filtres ni paginació — s'ampliarà després. Estil Model D.

**No calen canvis de backend** (les dades ja les serveix `PlantasService`).

### Bloc C — "Guardadas" dins de Perfil

**Fitxers:**
- Crear: `src/app/shared/components/guardadas-tabs/guardadas-tabs.ts`, `.html`, `.scss`
- Modificar: `src/app/pages/perfil/perfil.html` (hi insereix `<app-guardadas-tabs>` sota Estadísticas)

**Comportament:**
- Selector de 2 tabs, "Recetas" i "Posts", amb el mateix llenguatge visual de targeta Model D que la resta de Perfil.
- Tab Recetas: `RecetasService.getRecetasGuardadas(usuarioId)`; llista compacta (miniatura 44×44 + nom); "Ver todas" (link a `/recetas`) si n'hi ha més de 3; estat buit amigable si no n'hi ha cap.
- Tab Posts: `ComunidadService.getPublicacionesGuardadas()` (Bloc D); mateix patró de llista/buit/"Ver todas" (link a `/comunidad`).
- Depèn del Bloc D per al tab Posts; el tab Recetas es pot implementar sense dependències nyoves.

### Bloc D — Guardar publicacions (nova funcionalitat de cap a cap)

**Backend — fitxers a modificar:** `backend/models.py`, `backend/schemas.py`, `backend/crud.py`, `backend/main.py`

- `models.py` — nova taula, seguint exactament el patró de `PublicacionLike` (l'usuari de comunitat és el Firebase UID string, no el `usuario_id` numèric de `Usuario`):
  ```python
  class PublicacionGuardada(Base):
      __tablename__ = "publicaciones_guardadas"
      publicacion_id = Column(Integer, ForeignKey("publicaciones.publicacion_id", ondelete="CASCADE"), primary_key=True)
      usuario_id = Column(String(128), primary_key=True)
  ```
- `schemas.py` — `schemas.Publicacion` guanya el camp `guardada: bool`; nou `class GuardarToggle(BaseModel): usuario_id: str` (mateix patró que `LikeToggle`).
- `crud.py` — `toggle_guardar_publicacion(db, publicacion_id, usuario_id)` (mateixa lògica que `toggle_like`, contra la taula nova); `get_publicaciones_guardadas(db, usuario_id)` (join `Publicacion` amb `PublicacionGuardada`); `serializar_publicacion()` passa a rebre també si l'usuari l'ha guardada i ho inclou a la resposta.
- `main.py` — 3 endpoints nous:
  ```
  POST   /publicaciones/{publicacion_id}/guardar   (body: GuardarToggle)
  DELETE /publicaciones/{publicacion_id}/guardar   (body: GuardarToggle)
  GET    /usuarios/{uid}/publicaciones-guardadas
  ```

**Frontend — fitxers a modificar:**
- `src/app/models/interfaces.ts` — `Publicacion.guardada: boolean` nou camp.
- `src/app/services/comunidad.ts` — `toggleGuardar(publicacionId, currentlyGuardada)` i `getPublicacionesGuardadas()`, seguint el patró de `toggleLike()`/`actualizarEnFeed()`; `ApiPublicacion`/`mapPublicacion()` inclouen `guardada`.
- `src/app/shared/components/publicacion-card/publicacion-card.html`/`.ts` — nou botó bookmark SVG a `.pub-card__acciones`, al costat del de like, `[class.guardado]="publicacion.guardada"`, `(click)="toggleGuardar()"`.

**Verificació:** `ng build` sense errors nous; comprovació manual dels 3 endpoints (Swagger/`curl`) abans de donar per bo el bloc.

## Icones noves d'aquesta branca

Totes SVG inline, `viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"` (mateix patró que `planta-card.html`): campana (notificacions), cadenat (seguretat), engranatge (configuració), bookmark (guardar post). Cap altra icona de l'app es toca.

## Fora d'abast

- Substituir emojis a la resta de l'app (17 fitxers identificats: `receta-card`, `publicacion-card` existent, badges de dieta/categoria, `home`, `login`, `register`, `chat`, etc.) — feature separada.
- Fer funcionals els botons de Notificaciones/Seguridad/Configuración — continuen sent visuals.
- Filtratge per estat a `/plantas-historial`, paginació, o vincular cada stat individual a un filtre concret.
- Pàgina dedicada de "totes les guardades" — "Ver todas" navega a `/recetas`/`/comunidad` tal qual.
- Historial real d'esborrades per a "Plantas gestionadas" (queda igual que "Plantas" fins que existeixi aquest mecanisme).

## Ordre d'implementació

Blocs A → B → C → D, cadascun amb parada per revisió abans de continuar (Bloc C depèn parcialment de Bloc D per al tab de Posts, però es pot maquetar/aturar abans d'implementar-lo del tot).
