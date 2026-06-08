from sqlalchemy.orm import Session
import models
import schemas

# --- LÓGICA PARA USUARIOS ---

def get_usuario_by_email(db: Session, email: str):
    return db.query(models.Usuario).filter(models.Usuario.email == email).first()

def crear_usuario(db: Session, usuario: schemas.UsuarioCreate):
    db_usuario = models.Usuario(
        nombre=usuario.nombre,
        nombre_usuario=usuario.nombre_usuario,
        email=usuario.email,
        contrasena=usuario.contrasena, 
        tipo_dieta=usuario.tipo_dieta
    )
    db.add(db_usuario)
    db.commit() 
    db.refresh(db_usuario) 
    return db_usuario

# --- LÓGICA PARA PLANTAS ---

def get_plantas(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.PlantaCat).offset(skip).limit(limit).all()

def crear_planta_usuario(db: Session, planta: schemas.PUsuarioCreate, usuario_id: int):
    db_planta = models.PUsuario(**planta.model_dump(), usuario_id=usuario_id)
    db.add(db_planta)
    db.commit()
    db.refresh(db_planta)
    return db_planta

# --- NUEVO: CREAR PLANTA EN EL CATÁLOGO MAESTRO ---
def crear_planta_catalogo(db: Session, planta: schemas.PlantaCatCreate):
    # Inserta la planta directamente en la tabla PlantaCat (catálogo general)
    db_planta = models.PlantaCat(**planta.model_dump())
    db.add(db_planta)
    db.commit()
    db.refresh(db_planta)
    return db_planta