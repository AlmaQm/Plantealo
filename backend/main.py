from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import models, schemas, crud, database
import time
import csv
from codecs import iterdecode

app = FastAPI(title="Plantealo API")

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