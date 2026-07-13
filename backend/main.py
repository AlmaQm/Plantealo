from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from dotenv import load_dotenv
from groq import Groq
import models, schemas, crud, database
import os
import time

load_dotenv()  # Asegura que GROQ_API_KEY y demás variables estén disponibles

app = FastAPI(title="Plantealo API")

# --- CORS ---
# localhost:4200 para desarrollo; regex para cualquier subdominio *.onrender.com
# (Starlette no soporta comodines en allow_origins, por eso el subdominio va por regex.
#  Con regex el origen concreto se refleja, compatible con allow_credentials=True.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
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


# --- COMUNIDAD ---

@app.get("/publicaciones/", response_model=List[schemas.Publicacion])
def listar_publicaciones(uid: Optional[str] = None, db: Session = Depends(get_db)):
    return crud.listar_publicaciones(db, uid=uid)

@app.post("/publicaciones/", response_model=schemas.Publicacion)
def crear_publicacion(publicacion: schemas.PublicacionCreate, db: Session = Depends(get_db)):
    return crud.crear_publicacion(db=db, publicacion=publicacion)

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
