from sqlalchemy.orm import Session
import models
import schemas

# --- LÓGICA PARA USUARIOS ---

def get_usuario_by_email(db: Session, email: str):
    # Busca en la tabla usuarios si existe ese email
    return db.query(models.Usuario).filter(models.Usuario.email == email).first()

def crear_usuario(db: Session, usuario: schemas.UsuarioCreate):
    # 1. Preparamos el modelo con los datos que vienen del Schema
    # NOTA: En el futuro, aquí encriptaremos la contraseña
    db_usuario = models.Usuario(
        nombre=usuario.nombre,
        nombre_usuario=usuario.nombre_usuario,
        email=usuario.email,
        contrasena=usuario.contrasena, 
        tipo_dieta=usuario.tipo_dieta
    )
    
    # 2. Lo guardamos en la base de datos (Docker)
    db.add(db_usuario)
    db.commit() # Confirma la operación
    db.refresh(db_usuario) # Nos devuelve el usuario con su ID generado
    return db_usuario

# --- LÓGICA PARA PLANTAS ---

def get_plantas(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Planta).offset(skip).limit(limit).all()

def crear_planta_usuario(db: Session, planta: schemas.PlantaCreate, usuario_id: int):
    db_planta = models.Planta(**planta.model_dump(), usuario_id=usuario_id)
    db.add(db_planta)
    db.commit()
    db.refresh(db_planta)
    return db_planta