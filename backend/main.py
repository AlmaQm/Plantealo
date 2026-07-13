from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models, schemas, crud, database
import time
import csv
from codecs import iterdecode

app = FastAPI(title="Plantealo API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "http://127.0.0.1:4200"],
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


# --- NUEVO: ENLACES PARA EL CATÁLOGO DE PLANTAS Y CSV ---

@app.get("/plantas/", response_model=list[schemas.PlantaCat])
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


# --- NIVEL 1: ¿QUÉ PUEDO COCINAR CON MI HUERTO? ---

@app.post("/recetas/buscar-por-huerto", response_model=schemas.ClasificacionRecetasResponse)
def buscar_recetas_por_huerto(consulta: schemas.ConsultaHuertoRequest, db: Session = Depends(get_db)):
    """Clasifica las recetas según los ingredientes que le faltan al usuario para completarlas."""
    return crud.clasificar_recetas_por_huerto(db=db, ids_plantas=consulta.ids_plantas)


@app.post("/recetas/feed", response_model=list[schemas.RecetaHuerto])
def feed_recetas_inteligente(consulta: schemas.ConsultaHuertoRequest, db: Session = Depends(get_db)):
    """Feed plano de recetas, cada una con los ingredientes que le faltan al usuario en ese momento."""
    return crud.get_feed_recetas_inteligente(db=db, ids_plantas=consulta.ids_plantas)


# --- CREACIÓN DE RECETAS ---

@app.post("/recetas", response_model=schemas.RecetaBase, status_code=201)
def crear_receta(receta: schemas.RecetaCreate, usuario_id: int, db: Session = Depends(get_db)):
    """Crea una receta y vincula automáticamente sus ingredientes buscándolos por nombre en el catálogo."""
    return crud.crear_receta_completa(db=db, receta_in=receta, usuario_id=usuario_id)


# --- RECETAS GUARDADAS ---

@app.post("/recetas/{id_receta}/guardar")
def guardar_receta_endpoint(id_receta: int, usuario_id: int, db: Session = Depends(get_db)):
    """Guarda una receta en el perfil del usuario. usuario_id llega por query param hasta tener JWT."""
    crud.guardar_receta(db=db, usuario_id=usuario_id, id_receta=id_receta)
    return {"status": "success", "detail": "Receta guardada correctamente."}


@app.delete("/recetas/{id_receta}/desguardar")
def desguardar_receta_endpoint(id_receta: int, usuario_id: int, db: Session = Depends(get_db)):
    """Elimina una receta del perfil del usuario. usuario_id llega por query param hasta tener JWT."""
    crud.desguardar_receta(db=db, usuario_id=usuario_id, id_receta=id_receta)
    return {"status": "success", "detail": "Receta eliminada de guardados."}


@app.get("/usuarios/{usuario_id}/recetas-guardadas", response_model=list[schemas.RecetaBase])
def listar_recetas_guardadas(usuario_id: int, db: Session = Depends(get_db)):
    """Devuelve las recetas que el usuario tiene guardadas."""
    return crud.get_recetas_guardadas(db=db, usuario_id=usuario_id)