from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from dotenv import load_dotenv
from groq import Groq
import httpx
import models, schemas, crud, database
import os
import time
import csv
from codecs import iterdecode
import json

load_dotenv()  # Asegura que GROQ_API_KEY y demás variables estén disponibles

app = FastAPI(title="Plantealo API")

# --- CORS ---
# localhost:4200 y 127.0.0.1:4200 explícitos para desarrollo local; regex solo
# para cualquier subdominio *.onrender.com en producción (Starlette no soporta
# comodines en allow_origins, por eso ese caso va por regex).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "http://127.0.0.1:4200"],
    allow_origin_regex=r"https://.*\.onrender\.com",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Crear tablas al iniciar
@app.on_event("startup")
def startup():
    for _ in range(10):
        try:
            models.Base.metadata.create_all(bind=database.engine)
            break
        except Exception:
            time.sleep(2)

# Dependencia para la base de datos
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def home():
    return {"status": "Plantealo Backend Working"}

@app.post("/usuarios/", response_model=schemas.Usuario)
def register_user(usuario: schemas.UsuarioCreate, db: Session = Depends(get_db)):
    db_user = crud.get_usuario_by_email(db, email=usuario.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email ya registrado")
    return crud.crear_usuario(db=db, usuario=usuario)

@app.post("/usuarios/{usuario_id}/plantas/", response_model=schemas.PUsuario)
def add_planta_to_user(usuario_id: int, planta: schemas.PUsuarioCreate, db: Session = Depends(get_db)):
    return crud.crear_planta_usuario(db=db, planta=planta, usuario_id=usuario_id)

@app.get("/usuarios/{usuario_id}/plantas/ids", response_model=list[int])
def get_plantas_ids_usuario(usuario_id: int, db: Session = Depends(get_db)):
    """IDs (compatibles con el catálogo de ingredientes) de las plantas del huerto del usuario."""
    return crud.get_plantas_ids_usuario(db=db, usuario_id=usuario_id)

@app.get("/plantas/", response_model=List[schemas.PlantaCat])
def get_catalogo_plantas(db: Session = Depends(get_db)):
    """Devuelve la lista de todas las plantas disponibles en el catálogo."""
    return crud.get_plantas(db)

@app.post("/plantas/cargar-csv/", tags=["Admin"])
def upload_catalogo_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Endpoint para subir el archivo CSV y llenar la tabla de catálogo."""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="El archivo adjunto debe ser formato .csv")

    try:
        # Decodificamos el archivo binario para leerlo como texto
        lineas = iterdecode(file.file, 'utf-8')
        lector_csv = csv.DictReader(lineas)

        contador = 0
        for fila in lector_csv:
            # Mapeamos los datos del CSV convirtiéndolos a los tipos de datos correctos
            nueva_planta = schemas.PlantaCatCreate(
                nombre_planta=fila['nombre_planta'],
                hortaliza=fila['hortaliza'].lower() in ['1', 'true', 'yes'],
                imagen_url=fila.get('imagen_url', ''),
                tipo_planta=fila['tipo_planta'].upper(), # Asegura mayúsculas (INTERIOR, EXTERIOR, TODAS)
                freq_riego=int(fila['freq_riego']),
                clima=fila['clima'],
                h_luzsolar=int(fila['h_luzsolar']),
                caracteristicas=fila['caracteristicas'][:50] # Forzamos límite de 50 caracteres del SQL viejo
            )
            crud.crear_planta_catalogo(db=db, planta=nueva_planta)
            contador += 1

        return {"status": "success", "detail": f"Se han procesado y subido {contador} plantas correctamente."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al procesar el archivo CSV: {str(e)}")


# --- SINCRONIZACIÓN FIREBASE ↔ AIVEN ---

@app.post("/usuarios/sync", response_model=schemas.UsuarioOut)
def sync_usuario(data: schemas.UsuarioSync, db: Session = Depends(get_db)):
    return crud.upsert_usuario(db, data)

@app.get("/usuarios/by-uid/{firebase_uid}", response_model=schemas.UsuarioOut)
def get_usuario_by_uid(firebase_uid: str, db: Session = Depends(get_db)):
    usuario = crud.get_usuario_by_firebase_uid(db, firebase_uid)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario

@app.get("/usuarios/by-uid/{firebase_uid}/plantas/", response_model=List[schemas.PUsuarioDetall])
def get_plantas_by_uid(firebase_uid: str, db: Session = Depends(get_db)):
    usuario = crud.get_usuario_by_firebase_uid(db, firebase_uid)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    filas = crud.get_plantas_usuario(db, usuario.usuario_id)
    return [
        schemas.PUsuarioDetall(
            planta_id=pu.planta_id,
            usuario_id=pu.usuario_id,
            f_siembra=pu.f_siembra,
            f_recogida=pu.f_recogida,
            estado_crecimiento=pu.estado_crecimiento,
            nombre_planta=cat.nombre_planta,
            tipo_planta=cat.tipo_planta,
            freq_riego=cat.freq_riego,
            imagen_url=cat.imagen_url,
            clima=cat.clima,
            caracteristicas=cat.caracteristicas,
        )
        for pu, cat in filas
    ]

@app.post("/usuarios/by-uid/{firebase_uid}/plantas/", response_model=schemas.PUsuario)
def add_planta_by_uid(firebase_uid: str, planta: schemas.PUsuarioCreate, db: Session = Depends(get_db)):
    usuario = crud.get_usuario_by_firebase_uid(db, firebase_uid)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return crud.crear_planta_usuario(db=db, planta=planta, usuario_id=usuario.usuario_id)

@app.get("/usuarios/{usuario_id}/plantas/", response_model=List[schemas.PUsuarioDetall])
def get_plantas_de_usuario(usuario_id: int, db: Session = Depends(get_db)):
    filas = crud.get_plantas_usuario(db, usuario_id)
    return [
        schemas.PUsuarioDetall(
            planta_id=pu.planta_id,
            usuario_id=pu.usuario_id,
            f_siembra=pu.f_siembra,
            f_recogida=pu.f_recogida,
            estado_crecimiento=pu.estado_crecimiento,
            nombre_planta=cat.nombre_planta,
            tipo_planta=cat.tipo_planta,
            freq_riego=cat.freq_riego,
            imagen_url=cat.imagen_url,
            clima=cat.clima,
            caracteristicas=cat.caracteristicas,
        )
        for pu, cat in filas
    ]


# --- COMUNIDAD ---

@app.get("/publicaciones/", response_model=List[schemas.Publicacion])
def listar_publicaciones(uid: Optional[str] = None, db: Session = Depends(get_db)):
    return crud.listar_publicaciones(db, uid=uid)

@app.post("/publicaciones/", response_model=schemas.Publicacion)
def crear_publicacion(publicacion: schemas.PublicacionCreate, db: Session = Depends(get_db)):
    return crud.crear_publicacion(db=db, publicacion=publicacion)

@app.put("/publicaciones/{publicacion_id}", response_model=schemas.Publicacion)
def editar_publicacion(publicacion_id: int, body: schemas.PublicacionEdit, db: Session = Depends(get_db)):
    db_pub = crud.editar_publicacion(db, publicacion_id, body.usuario_id, body.categoria, body.descripcion)
    if not db_pub:
        raise HTTPException(status_code=404, detail="Publicación no encontrada o no eres el autor")
    return crud.serializar_publicacion(db_pub, body.usuario_id)

@app.delete("/publicaciones/{publicacion_id}")
def eliminar_publicacion(publicacion_id: int, usuario_id: str, db: Session = Depends(get_db)):
    ok = crud.eliminar_publicacion(db, publicacion_id, usuario_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Publicación no encontrada o no eres el autor")
    return {"status": "eliminada"}

@app.patch("/publicaciones/{publicacion_id}/imagen", response_model=schemas.Publicacion)
def actualizar_imagen_publicacion(publicacion_id: int, body: schemas.ImagenUpdate, db: Session = Depends(get_db)):
    db_pub = crud.actualizar_imagen_publicacion(db, publicacion_id, body.imagen_url)
    if not db_pub:
        raise HTTPException(status_code=404, detail="Publicación no encontrada")
    return crud.serializar_publicacion(db_pub, None)

@app.post("/publicaciones/{publicacion_id}/like", response_model=schemas.Publicacion)
def toggle_like(publicacion_id: int, body: schemas.LikeToggle, db: Session = Depends(get_db)):
    resultado = crud.toggle_like(db, publicacion_id, body.usuario_id)
    if not resultado:
        raise HTTPException(status_code=404, detail="Publicación no encontrada")
    return resultado

@app.post("/publicaciones/{publicacion_id}/comentarios", response_model=schemas.Publicacion)
def agregar_comentario(publicacion_id: int, comentario: schemas.ComentarioCreate, db: Session = Depends(get_db)):
    resultado = crud.crear_comentario(db, publicacion_id, comentario)
    if not resultado:
        raise HTTPException(status_code=404, detail="Publicación no encontrada")
    return resultado


# --- TIEMPO (AEMET) ---
# La key vive solo aqui (no en el frontend) y la llamada real a AEMET se
# cachea: asi da igual cuantos usuarios abran la app a la vez, solo
# gastamos cuota de AEMET una vez cada CACHE_TTL_SEGUNDOS. Si AEMET falla,
# servimos la ultima respuesta buena que tengamos en vez de nada.
AEMET_MUNICIPIO = "08019"
AEMET_CACHE_TTL_SEGUNDOS = 30 * 60

_tiempo_cache: dict = {"datos": None, "timestamp": 0.0}

@app.get("/tiempo")
def get_tiempo():
    api_key = os.getenv("AEMET_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="AEMET_API_KEY no está configurada en el servidor.")

    ahora = time.time()
    if _tiempo_cache["datos"] is not None and (ahora - _tiempo_cache["timestamp"]) < AEMET_CACHE_TTL_SEGUNDOS:
        return _tiempo_cache["datos"]

    try:
        with httpx.Client(timeout=10) as client:
            r1 = client.get(
                f"https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/diaria/{AEMET_MUNICIPIO}",
                params={"api_key": api_key},
            )
            r1.raise_for_status()
            # AEMET responde en ISO-8859-15, no UTF-8; Response.json() de httpx
            # decodifica el contenido como UTF-8 igualmente y revienta con
            # tildes/ñ, asi que decodificamos los bytes a mano con el codec
            # correcto antes de parsear el JSON.
            datos_url = json.loads(r1.content.decode("ISO-8859-15"))["datos"]
            r2 = client.get(datos_url)
            r2.raise_for_status()
            datos = json.loads(r2.content.decode("ISO-8859-15"))
    except Exception as e:
        if _tiempo_cache["datos"] is not None:
            return _tiempo_cache["datos"]
        raise HTTPException(status_code=502, detail=f"No se ha podido obtener el tiempo de AEMET: {e}")

    _tiempo_cache["datos"] = datos
    _tiempo_cache["timestamp"] = ahora
    return datos


# --- CHAT CON GROQ ---

# Modelos de Groq (IDs verificados en la documentación de Groq):
#   - Visión (acepta imágenes): meta-llama/llama-4-scout-17b-16e-instruct
#   - Texto puro:               llama-3.3-70b-versatile
GROQ_MODELO_VISION = "meta-llama/llama-4-scout-17b-16e-instruct"
GROQ_MODELO_TEXTO = "llama-3.3-70b-versatile"


class ChatRequest(BaseModel):
    mensaje: str
    plantas: List[str] = []
    imagen_base64: Optional[str] = None


class ChatResponse(BaseModel):
    respuesta: str


@app.post("/chat/", response_model=ChatResponse)
def chat(req: ChatRequest):
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="GROQ_API_KEY no está configurada en el servidor.",
        )

    plantas_txt = ", ".join(req.plantas) if req.plantas else "ninguna planta registrada todavía"
    system_prompt = (
        "Eres un asistente experto en jardinería y horticultura para la app Plantéalo. "
        f"El usuario tiene actualmente estas plantas en su huerto: {plantas_txt}. "
        "Ofrece consejos prácticos y concretos sobre riego, cuidados, plagas, cosecha y clima "
        "adaptados a esas plantas. "
        "Responde SIEMPRE en el mismo idioma en el que te escriba el usuario "
        "(catalán, castellano, inglés, etc.). "
        "Sé cercano, claro y directo."
    )

    # Con imagen → modelo de visión y contenido multimodal; sin imagen → texto puro.
    if req.imagen_base64:
        modelo = GROQ_MODELO_VISION
        contenido_usuario = [
            {"type": "text", "text": req.mensaje},
            {
                "type": "image_url",
                "image_url": {"url": f"data:image/jpeg;base64,{req.imagen_base64}"},
            },
        ]
    else:
        modelo = GROQ_MODELO_TEXTO
        contenido_usuario = req.mensaje

    mensajes = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": contenido_usuario},
    ]

    try:
        client = Groq(api_key=api_key)
        completion = client.chat.completions.create(
            model=modelo,
            messages=mensajes,
            temperature=0.7,
            max_tokens=1024,
        )
        respuesta = completion.choices[0].message.content or ""
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Error al contactar con Groq: {e}")

    return ChatResponse(respuesta=respuesta)


# --- NIVEL 1: ¿QUÉ PUEDO COCINAR CON MI HUERTO? ---

@app.post("/recetas/buscar-por-huerto", response_model=schemas.ClasificacionRecetasResponse)
def buscar_recetas_por_huerto(consulta: schemas.ConsultaHuertoRequest, db: Session = Depends(get_db)):
    """Clasifica las recetas según los ingredientes que le faltan al usuario para completarlas."""
    return crud.clasificar_recetas_por_huerto(
        db=db, ids_plantas=consulta.ids_plantas, usuario_id=consulta.usuario_id
    )


@app.post("/recetas/feed", response_model=list[schemas.RecetaHuerto])
def feed_recetas_inteligente(consulta: schemas.ConsultaHuertoRequest, db: Session = Depends(get_db)):
    """Feed plano de recetas, cada una con los ingredientes que le faltan al usuario y si ya la guardó."""
    return crud.get_feed_recetas_inteligente(
        db=db, ids_plantas=consulta.ids_plantas, usuario_id=consulta.usuario_id
    )


# --- CREACIÓN DE RECETAS ---

@app.post("/recetas", response_model=schemas.RecetaBase, status_code=201)
def crear_receta(receta: schemas.RecetaCreate, usuario_id: int, db: Session = Depends(get_db)):
    """Crea una receta y vincula automáticamente sus ingredientes buscándolos por nombre en el catálogo."""
    return crud.crear_receta_completa(db=db, receta_in=receta, usuario_id=usuario_id)


# --- RECETAS GUARDADAS ---

@app.post("/usuarios/{usuario_id}/recetas-guardadas/{id_receta}")
def guardar_receta_endpoint(usuario_id: int, id_receta: int, db: Session = Depends(get_db)):
    """Guarda una receta en el perfil del usuario."""
    crud.guardar_receta(db=db, usuario_id=usuario_id, id_receta=id_receta)
    return {"status": "success", "detail": "Receta guardada correctamente."}


@app.delete("/usuarios/{usuario_id}/recetas-guardadas/{id_receta}")
def desguardar_receta_endpoint(usuario_id: int, id_receta: int, db: Session = Depends(get_db)):
    """Elimina una receta del perfil del usuario."""
    crud.desguardar_receta(db=db, usuario_id=usuario_id, id_receta=id_receta)
    return {"status": "success", "detail": "Receta eliminada de guardados."}


@app.get("/usuarios/{usuario_id}/recetas-guardadas", response_model=list[schemas.RecetaBase])
def listar_recetas_guardadas(usuario_id: int, db: Session = Depends(get_db)):
    """Devuelve las recetas que el usuario tiene guardadas."""
    return crud.get_recetas_guardadas(db=db, usuario_id=usuario_id)
