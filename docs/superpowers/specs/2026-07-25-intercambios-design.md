# Intercambios — Design Spec
Date: 2026-07-25

## Overview

Cuando el usuario marca como hecha una tarea de "cosechar" en Home, se le pregunta con una mini card si le ha sobrado cosecha. Si dice que sí, se crea automáticamente una publicación en un apartado nuevo, **Intercambios**, donde otros usuarios pueden ver y filtrar por ciudad y por verdura quién tiene excedente. Es informativo únicamente (sin contacto ni chat): nombre, verdura, cantidad aproximada, ciudad y fecha.

Entidad completamente independiente de `Publicacion` (Comunidad): backend propio (`Intercambio`), schemas propios, endpoints propios. Comunidad no se toca.

## Decisiones de producto cerradas

1. **Cantidad**: texto libre y opcional (ej. "un par de kilos"), no numérico estructurado.
2. **Ciudad**: selector cerrado (lista fija servida por el backend vía `GET /ciudades/`), no texto libre. Única fuente de verdad en `backend/ciudades.py` — el frontend nunca duplica la lista. Se captura en el registro; campo nuevo `ciudad` en `Usuario` (nullable, aditivo).
3. **Contacto entre usuarios**: fuera de alcance. Sin chat, sin email visible. Solo informativo.
4. **Ciclo de vida**: caduca sola a los 7 días (constante `INTERCAMBIO_DIAS_CADUCIDAD`, calculada al listar — sin cron) y el autor puede cerrarla manualmente antes con "Ya no disponible".
5. **Catálogo de verduras**: reutiliza `PlantaCat` / tabla `plantas` / campo `hortaliza`. Sin catálogo nuevo.
6. **Ciudad faltante en el perfil** (usuarios existentes migrados antes de este cambio, o cualquiera que aún no la haya rellenado): la propia mini card de "¿te ha sobrado cosecha?" muestra un selector de ciudad inline como fallback de una sola vez; al guardar, esa ciudad se propaga también al perfil del usuario (mismo mecanismo que `AuthService.actualizarPerfil`, para que la próxima vez ya no haga falta preguntar). No se toca la pantalla de Perfil/Configuración para esto.

## Restricciones de seguridad (no tocar nada existente)

- No se modifica `Publicacion`/`PublicacionLike`/`PublicacionGuardada`/`Comentario` en `backend/models.py`, ni sus schemas, ni los endpoints `/publicaciones/*` en `backend/main.py`, ni `src/app/pages/comunidad/`, `src/app/shared/components/publicacion-card/`, `src/app/services/comunidad.ts`.
- No se toca la lógica de RIEGO ni ENFERMA en `home.ts`. El hook nuevo entra solo dentro de la rama `task.tipo === 'COSECHA'` de `toggleTask()`, sin alterar el resto del método ni `marcarCosecha` (que sigue funcionando exactamente igual, en paralelo).
- Todo cambio de esquema es aditivo: columna nueva nullable en `usuario`, tabla nueva `intercambios`. Nada se renombra ni se borra. La tabla `intercambios` la crea sola `Base.metadata.create_all()` en el próximo arranque del backend. La columna `ciudad` en `usuario` (tabla ya existente en Aiven) requiere ALTER manual — ver sección "Migración pendiente".

## Migración pendiente en Aiven (NO ejecutar automáticamente)

```sql
ALTER TABLE usuario ADD COLUMN ciudad VARCHAR(80) NULL;
```

Se debe pedir confirmación explícita al usuario antes de aplicar esto contra producción.

## Archivos a crear / modificar

| Archivo | Acción |
|---|---|
| `backend/ciudades.py` | Crear — lista cerrada de municipios del área de Barcelona |
| `backend/models.py` | Añadir columna `ciudad` a `Usuario` (nullable) + modelo nuevo `Intercambio` |
| `backend/schemas.py` | Añadir `ciudad` a `UsuarioBase`/`UsuarioSync`/`UsuarioOut`/`UsuarioCreate` (heredado) + schemas `IntercambioCreate`, `Intercambio`, `IntercambioCerrar` |
| `backend/crud.py` | Propagar `ciudad` en `upsert_usuario`/`crear_usuario` + funciones `crear_intercambio`, `listar_intercambios`, `cerrar_intercambio` |
| `backend/main.py` | Endpoint `GET /ciudades/` + endpoints `POST/GET /intercambios/`, `PATCH /intercambios/{id}/cerrar` |
| `src/app/models/interfaces.ts` | Añadir `ciudad?` a `Usuario` + interfaces `Intercambio`, `IntercambioCreate` |
| `src/app/pages/register/register.ts` / `.html` | Campo `ciudad` (select cerrado, cargado de `GET /ciudades/`) |
| `src/app/services/auth.ts` | Incluir `ciudad` en los payloads de sync (registro, sync, `actualizarPerfil`) |
| `src/app/services/intercambios.ts` | Crear — servicio siguiendo el patrón de `comunidad.ts` |
| `src/app/shared/components/sobra-cosecha-modal/*` | Crear — mini card "¿te ha sobrado cosecha?" (con fallback de ciudad) |
| `src/app/pages/home/home.ts` | Hook nuevo solo en la rama `tipo === 'COSECHA'` de `toggleTask()` |
| `src/app/pages/intercambios/*` | Crear — página nueva con filtros ciudad/verdura |
| `src/app/app.routes.ts` | Ruta `/intercambios` (`loadComponent` + `authGuard`) |
| `src/app/shared/components/navbar/navbar.html` | Entrada nueva "Intercambios" |

## Backend — Fase A: ciudad + catálogo de ciudades

`backend/ciudades.py`:
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
Ámbito acotado al área metropolitana de Barcelona, coherente con `AEMET_MUNICIPIO = "08019"` (Barcelona ciudad) ya hardcodeado en `main.py`.

`models.Usuario`: añadir `ciudad = Column(String(80), nullable=True)` (no tocar ninguna columna existente).

`schemas.py`: añadir `ciudad: Optional[str] = None` a `UsuarioBase` (con lo que `UsuarioCreate` la hereda), `UsuarioSync` y `UsuarioOut`.

`crud.upsert_usuario`: asignar `usuario.ciudad = data.ciudad` tanto en la rama de actualización como en la de creación (mismo patrón que `tipo_dieta`, sin condicional — si el frontend no la manda llega `None` y no rompe nada).

`crud.crear_usuario`: pasar `ciudad=usuario.ciudad` al construir `models.Usuario`.

`main.py`: 
```python
from ciudades import CIUDADES

@app.get("/ciudades/", response_model=List[str])
def get_ciudades():
    return CIUDADES
```

## Backend — Fase B: modelo y endpoints de Intercambio

`models.py`:
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

`schemas.py`:
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

`crud.py`:
```python
from datetime import datetime, timedelta, timezone

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

def _limite_caducidad() -> datetime:
    return datetime.now(timezone.utc) - timedelta(days=INTERCAMBIO_DIAS_CADUCIDAD)

def crear_intercambio(db: Session, data: schemas.IntercambioCreate) -> schemas.Intercambio:
    duplicado = (
        db.query(models.Intercambio)
        .filter(
            models.Intercambio.usuario_id == data.usuario_id,
            models.Intercambio.planta_id == data.planta_id,
            models.Intercambio.estado == "ACTIVA",
            models.Intercambio.fecha_creacion >= _limite_caducidad(),
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
        models.Intercambio.fecha_creacion >= _limite_caducidad(),
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

`main.py`:
```python
# --- INTERCAMBIOS ---

@app.post("/intercambios/", response_model=schemas.Intercambio)
def crear_intercambio(data: schemas.IntercambioCreate, db: Session = Depends(get_db)):
    return crud.crear_intercambio(db, data)

@app.get("/intercambios/", response_model=List[schemas.Intercambio])
def listar_intercambios(
    ciudad: Optional[str] = None,
    planta_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    return crud.listar_intercambios(db, ciudad=ciudad, planta_id=planta_id)

@app.patch("/intercambios/{intercambio_id}/cerrar", response_model=schemas.Intercambio)
def cerrar_intercambio(intercambio_id: int, body: schemas.IntercambioCerrar, db: Session = Depends(get_db)):
    intercambio = crud.cerrar_intercambio(db, intercambio_id, body.usuario_id)
    if not intercambio:
        raise HTTPException(status_code=404, detail="Publicación no encontrada o no eres el autor")
    return crud._serializar_intercambio(intercambio)
```

Nota: el 409 de duplicado se traduce en frontend a "ya tienes un excedente publicado de esta planta" y simplemente no se crea una segunda.

## Frontend — Fase C: ciudad en registro

`models/interfaces.ts`: añadir `ciudad?: string;` a `Usuario` (después de `imagen_url`).

`register.ts`: añadir control `ciudad: FormControl<string>` (nonNullable, `Validators.required`), signal `ciudades = signal<string[]>([])` cargada en el constructor vía `HttpClient.get<string[]>(environment.apiUrl + '/ciudades/')`, incluir `ciudad` en el objeto `data` que se pasa a `authService.register(...)`.

`register.html`: nuevo bloque `<select>` (mismo patrón visual que `tipo_dieta` pero como `<select>` porque es lista cerrada de ~20 opciones, no pills) entre "Tipo de dieta" y "Avatar":
```html
<label class="campo-label campo-label--mt" for="ciudad">Ciudad</label>
<select id="ciudad" class="campo-input" formControlName="ciudad">
  <option value="" disabled selected>Selecciona tu ciudad</option>
  @for (c of ciudades(); track c) {
    <option [value]="c">{{ c }}</option>
  }
</select>
@if (form.controls.ciudad.touched && form.controls.ciudad.hasError('required')) {
  <p class="error-inline">Selecciona tu ciudad</p>
}
```

`auth.ts`: en `register()` y `syncWithAiven()` (ambos payloads), añadir `ciudad: usuario.ciudad || data.ciudad || null` según corresponda a cada punto de construcción del payload. En `actualizarPerfil()`, ampliar el tipo del parámetro `datos` con `ciudad?: string` para poder usarse también desde el fallback inline de Fase E.

## Frontend — Fase D: servicio de Intercambios

`src/app/services/intercambios.ts`, mismo patrón que `comunidad.ts` (interfaz `Api*`, mapeo a interfaz de dominio, `HttpClient` + `firstValueFrom`, sin `signal` de estado global porque la página recarga siempre contra backend al cambiar filtros):

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { Intercambio } from '../models/interfaces';

interface ApiIntercambio {
  id: number;
  usuario_id: string;
  nombre_usuario: string;
  planta_id: number;
  nombre_planta: string;
  imagen_url: string | null;
  cantidad_aprox: string | null;
  ciudad: string;
  estado: string;
  fecha_creacion: string;
}

@Injectable({ providedIn: 'root' })
export class IntercambiosService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/intercambios`;

  private mapIntercambio(d: ApiIntercambio): Intercambio {
    return {
      id: d.id,
      usuario_id: d.usuario_id,
      nombre_usuario: d.nombre_usuario,
      planta_id: d.planta_id,
      nombre_planta: d.nombre_planta,
      imagen_url: d.imagen_url ?? 'assets/images/placeholder-receta.jpg',
      cantidad_aprox: d.cantidad_aprox,
      ciudad: d.ciudad,
      fecha_creacion: new Date(d.fecha_creacion),
    };
  }

  async listar(filtros: { ciudad?: string; planta_id?: number } = {}): Promise<Intercambio[]> {
    const params: Record<string, string> = {};
    if (filtros.ciudad) params['ciudad'] = filtros.ciudad;
    if (filtros.planta_id) params['planta_id'] = String(filtros.planta_id);
    const docs = await firstValueFrom(this.http.get<ApiIntercambio[]>(this.apiUrl + '/', { params }));
    return docs.map(d => this.mapIntercambio(d));
  }

  async crear(data: {
    usuario_id: string; nombre_usuario: string; planta_id: number;
    cantidad_aprox?: string; ciudad: string;
  }): Promise<Intercambio> {
    const creado = await firstValueFrom(this.http.post<ApiIntercambio>(this.apiUrl + '/', data));
    return this.mapIntercambio(creado);
  }

  async cerrar(id: number, usuarioId: string): Promise<void> {
    await firstValueFrom(this.http.patch(`${this.apiUrl}/${id}/cerrar`, { usuario_id: usuarioId }));
  }

  async getCiudades(): Promise<string[]> {
    return firstValueFrom(this.http.get<string[]>(`${environment.apiUrl}/ciudades/`));
  }
}
```

`models/interfaces.ts` añade:
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

## Frontend — Fase E: disparador en Home

Componente nuevo `SobraCosechaModalComponent` (`src/app/shared/components/sobra-cosecha-modal/`), mismo patrón visual que el `modal-dialog` centrado de Comunidad (overlay + dialog, `zoomIn`/`fadeIn`), NO el `confirm-modal` genérico (necesita un paso adicional de cantidad + posible selector de ciudad).

Inputs: `visible`, `nombrePlanta: string`, `plantaId: number`, `necesitaCiudad: boolean` (true si `usuario.ciudad` es null/vacío), `ciudades: string[]`.
Outputs: `cerrar` (sin publicar), `publicado` (con el `Intercambio` creado, para feedback opcional).

Flujo interno (signals):
- Paso 1: "¿Te ha sobrado cosecha de {{ nombrePlanta }}?" con botones Sí/No. No → `cerrar.emit()`.
- Paso 2 (si Sí): campo cantidad (opcional, texto libre) + si `necesitaCiudad()`, un `<select>` de ciudad (mismo `GET /ciudades/`) marcado como requerido solo en ese caso; botón "Publicar".
- Al publicar: llama a `IntercambiosService.crear(...)`; si `necesitaCiudad`, además llama `AuthService.actualizarPerfil({ ciudad })` para no volver a preguntar.

`home.ts` — `toggleTask()`, únicamente dentro de la rama `RIEGO`/`COSECHA` existente:
```typescript
const marcar = task.tipo === 'RIEGO'
  ? this.plantasService.marcarRiego(task.id, marcado)
  : this.plantasService.marcarCosecha(task.id, marcado);

marcar.catch(err => console.error('Error al marcar la tarea', err));

if (task.tipo === 'COSECHA' && marcado) {
  const planta = this.plantasService.inventario().find(p => p.id === task.id);
  if (planta) this.abrirSobraCosecha(planta);
}
```
`abrirSobraCosecha(planta: Planta)` guarda `plantaParaIntercambio` (signal) con `{ planta_id, nombre_planta }` y pone `sobraCosechaVisible.set(true)`. No se toca ni el cálculo de `marcar`, ni `RIEGO`, ni `ENFERMA`, ni `marcarCosecha` real.

## Frontend — Fase F: página Intercambios

`src/app/pages/intercambios/intercambios.ts` + `.html` + `.scss`, ruta `/intercambios` con `authGuard` (mismo patrón `loadComponent` que el resto). Entrada nueva en `navbar.html` (icono `ion-icon name="swap-horizontal-outline"`, label "Intercambios").

Filtros: dos `<select>` (ciudad — `GET /ciudades/`; verdura — `PlantasService.catalogo()`, ya cargado por la app) que al cambiar vuelven a llamar `IntercambiosService.listar({ ciudad, planta_id })`. Sin filtrado en cliente: la caducidad y el filtrado los decide siempre el backend.

Cada tarjeta: nombre, verdura + imagen del catálogo, cantidad aproximada (si existe), ciudad, fecha relativa. Botón "Ya no disponible" solo visible si `intercambio.usuario_id === authService` (uid actual del usuario logueado) — llama a `cerrar()` y quita la tarjeta de la lista local tras confirmar.

Sin botón de contacto (decisión #3): la tarjeta es puramente informativa.

## Verificación

- `ng build --configuration development` y `ng test --watch=false` tras cada tarea relevante de frontend.
- Backend local (`uvicorn main:app --reload` o equivalente) para probar `/ciudades/`, `/intercambios/` antes de dar por buena cada tarea de Fase A/B.
- Confirmar al final que Comunidad, Home (riego/enferma), Plantas y Recetas siguen funcionando exactamente igual.
