# Intercambios Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Al marcar "cosechar" como hecho en Home, preguntar con una mini card si ha sobrado cosecha; si es que sí, publicar automáticamente en un apartado nuevo "Intercambios" donde otros usuarios ven y filtran por ciudad/verdura quién tiene excedente. Solo informativo (sin contacto). Ver spec: `docs/superpowers/specs/2026-07-25-intercambios-design.md`.

**Architecture:** Entidad `Intercambio` totalmente independiente de `Publicacion` (Comunidad), mismo patrón de autoría por `firebase_uid` denormalizado. Ciudad como catálogo cerrado servido por el backend (`GET /ciudades/`), nunca duplicado en frontend. Caducidad de 7 días calculada al listar (sin cron). El hook de Home se inserta solo en la rama `COSECHA` de `toggleTask()`, sin tocar RIEGO/ENFERMA/`marcarCosecha`.

**Tech Stack:** FastAPI + SQLAlchemy + MySQL (Aiven) en backend; Angular 19 standalone + signals en frontend.

**IMPORTANTE — Aiven:** el ALTER TABLE de la columna `ciudad` en `usuario` (Fase A) NO se ejecuta automáticamente contra producción. Se indica el SQL exacto y se pide confirmación explícita antes de aplicarlo.

---

## Mapa de archivos

| Archivo | Acción |
|---|---|
| `backend/ciudades.py` | Crear |
| `backend/models.py` | Modificar (columna `ciudad` en `Usuario` + modelo `Intercambio`) |
| `backend/schemas.py` | Modificar (`ciudad` en schemas de usuario + schemas de `Intercambio`) |
| `backend/crud.py` | Modificar (`ciudad` en upsert/crear usuario + funciones de intercambio) |
| `backend/main.py` | Modificar (`GET /ciudades/` + endpoints de `/intercambios/`) |
| `src/app/models/interfaces.ts` | Modificar (`ciudad?` en `Usuario` + interfaz `Intercambio`) |
| `src/app/pages/register/register.ts` / `.html` | Modificar (campo ciudad) |
| `src/app/services/auth.ts` | Modificar (propagar `ciudad`) |
| `src/app/services/intercambios.ts` | Crear |
| `src/app/shared/components/sobra-cosecha-modal/*` | Crear |
| `src/app/pages/home/home.ts` | Modificar (hook en rama COSECHA) |
| `src/app/pages/intercambios/*` | Crear |
| `src/app/app.routes.ts` | Modificar (ruta `/intercambios`) |
| `src/app/shared/components/navbar/navbar.html` | Modificar (entrada nueva) |

---

## Task A: Backend — ciudad en Usuario + catálogo de ciudades

**Files:**
- Create: `backend/ciudades.py`
- Modify: `backend/models.py`, `backend/schemas.py`, `backend/crud.py`, `backend/main.py`

- [ ] **Step 1: Crear `backend/ciudades.py`**

```python
CIUDADES = [
    "Barcelona",
    "L'Hospitalet de Llobregat",
    "Badalona",
    "Santa Coloma de Gramenet",
    "Cornellà de Llobregat",
    "Sant Boi de Llobregat",
    "Sant Adrià de Besòs",
    "Esplugues de Llobregat",
    "Sant Just Desvern",
    "Sant Feliu de Llobregat",
    "Molins de Rei",
    "El Prat de Llobregat",
    "Viladecans",
    "Gavà",
    "Castelldefels",
    "Cerdanyola del Vallès",
    "Ripollet",
    "Montcada i Reixac",
    "Sabadell",
    "Terrassa",
    "Mataró",
    "Granollers",
]
```

- [ ] **Step 2: Añadir columna `ciudad` a `models.Usuario`**

En `backend/models.py`, dentro de `class Usuario`, añadir tras `imagen_url`:
```python
    ciudad = Column(String(80), nullable=True)  # ADITIVO: requiere ALTER manual en Aiven, ver plan Fase A
```

- [ ] **Step 3: Propagar `ciudad` en schemas de usuario**

En `backend/schemas.py`, añadir `ciudad: Optional[str] = None` a `UsuarioBase`, `UsuarioSync` y `UsuarioOut`.

- [ ] **Step 4: Propagar `ciudad` en crud.py**

En `upsert_usuario`, tanto en la rama de actualización como en la de creación, asignar `ciudad=data.ciudad` (o `usuario.ciudad = data.ciudad`). En `crear_usuario`, pasar `ciudad=usuario.ciudad` al construir `models.Usuario`.

- [ ] **Step 5: Endpoint `GET /ciudades/`**

En `backend/main.py`, añadir el import `from ciudades import CIUDADES` junto a los demás imports, y el endpoint:
```python
@app.get("/ciudades/", response_model=List[str])
def get_ciudades():
    return CIUDADES
```

- [ ] **Step 6: Verificar backend en local**

Levantar el backend (`uvicorn main:app --reload` desde `backend/`, con las variables de entorno/`.env` ya configuradas) y comprobar:
- `GET /ciudades/` devuelve la lista de 22 ciudades.
- `POST /usuarios/sync` con un payload que incluya `ciudad` no rompe (aunque la columna aún no exista en Aiven — ver nota abajo).

**Nota de bloqueo esperado:** hasta que se aplique el ALTER TABLE en Aiven, cualquier intento de guardar `ciudad` fallará en producción (columna inexistente). En local, si se usa SQLite/una base de pruebas distinta, `create_all()` la crea sola. Documentar esto y no bloquear el resto del trabajo por ello — se prueba end-to-end una vez aplicado el ALTER.

- [ ] **Step 7: Indicar el ALTER TABLE pendiente**

Mostrar al usuario y pedir confirmación antes de ejecutar nada contra Aiven:
```sql
ALTER TABLE usuario ADD COLUMN ciudad VARCHAR(80) NULL;
```

- [ ] **Step 8: Commit**

```bash
git add backend/ciudades.py backend/models.py backend/schemas.py backend/crud.py backend/main.py
git commit -m "feat(backend): add ciudad field to Usuario and GET /ciudades/ endpoint"
```

---

## Task B: Backend — modelo y endpoints de Intercambio

**Files:**
- Modify: `backend/models.py`, `backend/schemas.py`, `backend/crud.py`, `backend/main.py`

- [ ] **Step 1: Modelo `Intercambio` en `models.py`**

Añadir al final de `models.py`:
```python
# --- INTERCAMBIOS ---
# usuario_id aqui es el uid de Firebase Auth (string), mismo patron que Publicacion:
# el excedente se identifica por autor via Firebase, los datos de la publicacion
# viven siempre en esta base de datos, independiente de la entidad Publicacion.

class Intercambio(Base):
    __tablename__ = "intercambios"
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(String(128), nullable=False, index=True)
    nombre_usuario = Column(String(50), nullable=False)
    planta_id = Column(Integer, ForeignKey("plantas.planta_id"), nullable=False, index=True)
    cantidad_aprox = Column(String(80), nullable=True)
    ciudad = Column(String(80), nullable=False)
    estado = Column(String(10), nullable=False, default="ACTIVA")  # ACTIVA, CERRADA
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    especie = relationship("PlantaCat")
```

- [ ] **Step 2: Schemas en `schemas.py`**

```python
# --- INTERCAMBIOS ---

class IntercambioCreate(BaseModel):
    usuario_id: str
    nombre_usuario: str
    planta_id: int
    cantidad_aprox: Optional[str] = None
    ciudad: str

class Intercambio(BaseModel):
    id: int
    usuario_id: str
    nombre_usuario: str
    planta_id: int
    nombre_planta: str
    imagen_url: Optional[str] = None
    cantidad_aprox: Optional[str] = None
    ciudad: str
    estado: str
    fecha_creacion: datetime
    class Config:
        from_attributes = True

class IntercambioCerrar(BaseModel):
    usuario_id: str
```

- [ ] **Step 3: Funciones en `crud.py`**

Añadir el import `from datetime import date, datetime, timedelta, timezone` (ampliar el import de `datetime` ya existente) y:
```python
# --- LÓGICA PARA INTERCAMBIOS ---

INTERCAMBIO_DIAS_CADUCIDAD = 7

def _serializar_intercambio(i: models.Intercambio) -> schemas.Intercambio:
    return schemas.Intercambio(
        id=i.id,
        usuario_id=i.usuario_id,
        nombre_usuario=i.nombre_usuario,
        planta_id=i.planta_id,
        nombre_planta=i.especie.nombre_planta,
        imagen_url=i.especie.imagen_url,
        cantidad_aprox=i.cantidad_aprox,
        ciudad=i.ciudad,
        estado=i.estado,
        fecha_creacion=i.fecha_creacion,
    )

def _limite_caducidad_intercambios() -> datetime:
    return datetime.now(timezone.utc) - timedelta(days=INTERCAMBIO_DIAS_CADUCIDAD)

def crear_intercambio(db: Session, data: schemas.IntercambioCreate) -> schemas.Intercambio:
    duplicado = (
        db.query(models.Intercambio)
        .filter(
            models.Intercambio.usuario_id == data.usuario_id,
            models.Intercambio.planta_id == data.planta_id,
            models.Intercambio.estado == "ACTIVA",
            models.Intercambio.fecha_creacion >= _limite_caducidad_intercambios(),
        )
        .first()
    )
    if duplicado:
        raise HTTPException(
            status_code=409,
            detail="Ya tienes una publicación activa de excedente para esta planta"
        )
    db_intercambio = models.Intercambio(**data.model_dump())
    db.add(db_intercambio)
    db.commit()
    db.refresh(db_intercambio)
    return _serializar_intercambio(db_intercambio)

def listar_intercambios(
    db: Session, ciudad: Optional[str] = None, planta_id: Optional[int] = None
) -> list[schemas.Intercambio]:
    query = db.query(models.Intercambio).filter(
        models.Intercambio.estado == "ACTIVA",
        models.Intercambio.fecha_creacion >= _limite_caducidad_intercambios(),
    )
    if ciudad:
        query = query.filter(models.Intercambio.ciudad == ciudad)
    if planta_id:
        query = query.filter(models.Intercambio.planta_id == planta_id)
    intercambios = query.order_by(models.Intercambio.fecha_creacion.desc()).all()
    return [_serializar_intercambio(i) for i in intercambios]

def cerrar_intercambio(db: Session, intercambio_id: int, usuario_id: str) -> models.Intercambio | None:
    intercambio = db.query(models.Intercambio).filter(models.Intercambio.id == intercambio_id).first()
    if not intercambio or intercambio.usuario_id != usuario_id:
        return None
    intercambio.estado = "CERRADA"
    db.commit()
    db.refresh(intercambio)
    return intercambio
```

- [ ] **Step 4: Endpoints en `main.py`**

```python
# --- INTERCAMBIOS ---

@app.post("/intercambios/", response_model=schemas.Intercambio)
def crear_intercambio_endpoint(data: schemas.IntercambioCreate, db: Session = Depends(get_db)):
    return crud.crear_intercambio(db, data)

@app.get("/intercambios/", response_model=List[schemas.Intercambio])
def listar_intercambios_endpoint(
    ciudad: Optional[str] = None,
    planta_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    return crud.listar_intercambios(db, ciudad=ciudad, planta_id=planta_id)

@app.patch("/intercambios/{intercambio_id}/cerrar", response_model=schemas.Intercambio)
def cerrar_intercambio_endpoint(intercambio_id: int, body: schemas.IntercambioCerrar, db: Session = Depends(get_db)):
    intercambio = crud.cerrar_intercambio(db, intercambio_id, body.usuario_id)
    if not intercambio:
        raise HTTPException(status_code=404, detail="Publicación no encontrada o no eres el autor")
    return crud._serializar_intercambio(intercambio)
```

- [ ] **Step 5: Verificar en local**

Con el backend levantado: crear un usuario de prueba, crear una planta en su inventario, y probar con `curl`/Swagger (`/docs`):
- `POST /intercambios/` crea correctamente y devuelve `nombre_planta`/`imagen_url` vía join.
- Repetir el mismo `POST` para el mismo usuario+planta → 409.
- `GET /intercambios/?ciudad=Barcelona` filtra bien; sin filtros devuelve todas las activas no caducadas.
- `PATCH /intercambios/{id}/cerrar` con `usuario_id` distinto al autor → 404; con el autor correcto → pasa a `CERRADA` y desaparece del listado.

- [ ] **Step 6: Commit**

```bash
git add backend/models.py backend/schemas.py backend/crud.py backend/main.py
git commit -m "feat(backend): add Intercambio model, schemas and endpoints"
```

---

## Task C: Frontend — ciudad en registro

**Files:**
- Modify: `src/app/models/interfaces.ts`, `src/app/pages/register/register.ts`, `src/app/pages/register/register.html`, `src/app/services/auth.ts`

- [ ] **Step 1: Añadir `ciudad?` a `Usuario` en `interfaces.ts`**

```typescript
export interface Usuario {
  uid: string;
  usuario_id?: number;
  nombre: string;
  nombre_usuario: string;
  email: string;
  tipo_dieta: 'OMNIVORA' | 'VEGETARIANA' | 'VEGANA';
  imagen_url?: string;
  ciudad?: string;
  fechaRegistro?: Date;
}
```

- [ ] **Step 2: Campo `ciudad` en el formulario de registro (`register.ts`)**

Inyectar `HttpClient`, añadir signal `ciudades = signal<string[]>([])` cargada en el constructor con `environment.apiUrl + '/ciudades/'`, añadir `ciudad: FormControl<string>` al tipo `RegisterForm` y al `FormGroup` (`nonNullable`, `Validators.required`), e incluirla en el objeto `data` de `onSubmit()`.

- [ ] **Step 3: Select de ciudad en `register.html`**

Insertar entre el bloque de "Tipo de dieta" y el de "Avatar":
```html
<label class="campo-label campo-label--mt" for="ciudad">Ciudad</label>
<select id="ciudad" class="campo-input"
  [class.campo-input--error]="form.controls.ciudad.invalid && form.controls.ciudad.touched"
  formControlName="ciudad">
  <option value="" disabled>Selecciona tu ciudad</option>
  @for (c of ciudades(); track c) {
    <option [value]="c">{{ c }}</option>
  }
</select>
@if (form.controls.ciudad.touched && form.controls.ciudad.hasError('required')) {
  <p class="error-inline">Selecciona tu ciudad</p>
}
```

- [ ] **Step 4: Propagar `ciudad` en `auth.ts`**

En `syncWithAiven()` y en el payload de sync dentro de `register()`, añadir `ciudad: usuario.ciudad || null` al objeto `payload`. En `actualizarPerfil()`, ampliar el tipo de `datos` con `ciudad?: string`.

- [ ] **Step 5: Verificar**

```bash
ng build --configuration development
ng test --watch=false
```
Registrar un usuario nuevo desde el navegador (con backend local levantado) y comprobar en la respuesta de red que `ciudad` viaja en el payload de `/usuarios/sync`.

- [ ] **Step 6: Commit**

```bash
git add src/app/models/interfaces.ts src/app/pages/register/register.ts src/app/pages/register/register.html src/app/services/auth.ts
git commit -m "feat: add ciudad field to registration form and Usuario sync payloads"
```

---

## Task D: Frontend — servicio de Intercambios

**Files:**
- Modify: `src/app/models/interfaces.ts`
- Create: `src/app/services/intercambios.ts`

- [ ] **Step 1: Interfaz `Intercambio` en `interfaces.ts`**

```typescript
export interface Intercambio {
  id: number;
  usuario_id: string;
  nombre_usuario: string;
  planta_id: number;
  nombre_planta: string;
  imagen_url: string;
  cantidad_aprox: string | null;
  ciudad: string;
  fecha_creacion: Date;
}
```

- [ ] **Step 2: Crear `src/app/services/intercambios.ts`**

(contenido completo, ver spec — patrón `HttpClient` + `firstValueFrom` + mapeo `ApiIntercambio` → `Intercambio`, con métodos `listar`, `crear`, `cerrar`, `getCiudades`).

- [ ] **Step 3: Verificar**

```bash
ng build --configuration development
```

- [ ] **Step 4: Commit**

```bash
git add src/app/models/interfaces.ts src/app/services/intercambios.ts
git commit -m "feat: add IntercambiosService following ComunidadService pattern"
```

---

## Task E: Frontend — disparador en Home

**Files:**
- Create: `src/app/shared/components/sobra-cosecha-modal/sobra-cosecha-modal.ts` / `.html` / `.scss`
- Modify: `src/app/pages/home/home.ts`

- [ ] **Step 1: Crear `SobraCosechaModalComponent`**

Mismo patrón visual `modal-overlay` + `modal-dialog` que usa Comunidad (no el `confirm-modal` genérico, porque hay un segundo paso con formulario). Dos pasos internos con signal `paso = signal<'preguntar' | 'formulario'>('preguntar')`:
- Paso "preguntar": "¿Te ha sobrado cosecha de {{ nombrePlanta() }}?" con botones Sí / No.
- Paso "formulario" (si Sí): campo cantidad opcional + select de ciudad SOLO si `necesitaCiudad()` es true + botón Publicar.

Inputs: `visible`, `nombrePlanta`, `plantaId`, `necesitaCiudad`, `ciudades`. Outputs: `cerrar`, `publicado`.

- [ ] **Step 2: Enganchar en `home.ts`**

Dentro de `toggleTask()`, después del `marcar.catch(...)` existente y SIN modificar nada anterior:
```typescript
if (task.tipo === 'COSECHA' && marcado) {
  const planta = this.plantasService.inventario().find(p => p.id === task.id);
  if (planta) this.abrirSobraCosecha(planta);
}
```
Añadir el signal de estado del modal, el método `abrirSobraCosecha(planta: Planta)` (guarda `planta_id`/`nombre_planta`, resuelve `necesitaCiudad` desde `authService.getStoredUser()?.ciudad`, carga ciudades si hace falta) y el método que llama a `IntercambiosService.crear(...)` (y, si `necesitaCiudad`, también a `AuthService.actualizarPerfil({ ciudad })`).

- [ ] **Step 3: Añadir el componente al template de Home**

En `home.html`, añadir `<app-sobra-cosecha-modal ... />` al final, fuera de las secciones existentes, sin tocar el resto del template.

- [ ] **Step 4: Verificar**

```bash
ng build --configuration development
ng test --watch=false
```
Probar en el navegador: marcar una cosecha como hecha → aparece la mini card; decir "No" la cierra sin crear nada; decir "Sí" + Publicar crea el intercambio (verificar en `/intercambios/` del backend). Confirmar que RIEGO y ENFERMA se comportan exactamente igual que antes (sin mini card, sin cambios).

- [ ] **Step 5: Commit**

```bash
git add src/app/shared/components/sobra-cosecha-modal/ src/app/pages/home/home.ts src/app/pages/home/home.html
git commit -m "feat: prompt to publish surplus harvest as Intercambio from Home"
```

---

## Task F: Frontend — página Intercambios

**Files:**
- Create: `src/app/pages/intercambios/intercambios.ts` / `.html` / `.scss`
- Modify: `src/app/app.routes.ts`, `src/app/shared/components/navbar/navbar.html`

- [ ] **Step 1: Crear la página `Intercambios`**

`intercambios.ts`: signals `lista = signal<Intercambio[]>([])`, `ciudadFiltro = signal('')`, `verdulaFiltro = signal<number | null>(null)`, `ciudades = signal<string[]>([])`; usa `PlantasService.catalogo()` para el filtro de verdura. Método `cargar()` llama a `IntercambiosService.listar({ ciudad, planta_id })` cada vez que cambia un filtro. Botón "Ya no disponible" visible solo si `intercambio.usuario_id === auth.currentUser?.uid`; llama a `cerrar()` y recarga la lista.

- [ ] **Step 2: Ruta nueva en `app.routes.ts`**

```typescript
{
  path: 'intercambios',
  loadComponent: () => import('./pages/intercambios/intercambios').then(m => m.IntercambiosComponent),
  canActivate: [authGuard]
},
```

- [ ] **Step 3: Entrada en el navbar**

En `navbar.html`, añadir tras la entrada de "Comunidad":
```html
<a routerLink="/intercambios" routerLinkActive="active">
  <div class="icon-wrap">
    <ion-icon name="swap-horizontal-outline"></ion-icon>
    <span class="label">Cambios</span>
  </div>
</a>
```
Revisar `navbar.scss` para que 5 items quepan bien (puede requerir reducir el tamaño de fuente/gap si estaba pensado para 4).

- [ ] **Step 4: Verificar**

```bash
ng build --configuration development
ng test --watch=false
```
Navegar a `/intercambios`, comprobar que los filtros recargan contra el backend (ver Network tab), que "Ya no disponible" solo aparece en las publicaciones propias y que no hay ningún botón de contacto.

- [ ] **Step 5: Commit**

```bash
git add src/app/pages/intercambios/ src/app/app.routes.ts src/app/shared/components/navbar/navbar.html src/app/shared/components/navbar/navbar.scss
git commit -m "feat: add Intercambios page with ciudad/verdura filters and navbar entry"
```

---

## Task G: Verificación final

- [ ] **Step 1: Regresión manual**

Con el backend local levantado y sesión iniciada, comprobar que siguen funcionando exactamente igual que antes:
- Comunidad: crear publicación, dar like, comentar, guardar.
- Home: marcar RIEGO (sin mini card), marcar ENFERMA (sin persistencia, como antes), marcar COSECHA (con mini card nueva).
- Plantas: añadir/eliminar planta del inventario.
- Recetas: feed y filtros.

- [ ] **Step 2: Resumen para el usuario**

Reportar: qué se ha creado/modificado por fase, el ALTER TABLE pendiente en Aiven (con el SQL exacto), y cualquier decisión tomada durante la implementación que no estuviera ya cerrada en la spec.
