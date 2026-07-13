from sqlalchemy.orm import Session
import models
import schemas

# --- LÓGICA PARA USUARIOS ---

def get_usuario_by_email(db: Session, email: str):
    # Busca en la tabla usuarios si existe ese email
    return db.query(models.Usuario).filter(models.Usuario.email == email).first()

def get_usuario_by_firebase_uid(db: Session, firebase_uid: str):
    return db.query(models.Usuario).filter(
        models.Usuario.firebase_uid == firebase_uid
    ).first()

def upsert_usuario(db: Session, data: schemas.UsuarioSync):
    usuario = get_usuario_by_firebase_uid(db, data.firebase_uid)
    if usuario:
        # Actualitza perfil
        usuario.nombre = data.nombre
        usuario.nombre_usuario = data.nombre_usuario
        usuario.email = data.email
        usuario.tipo_dieta = data.tipo_dieta
        if data.imagen_url:
            usuario.imagen_url = data.imagen_url
    else:
        # Crea nou
        usuario = models.Usuario(
            firebase_uid=data.firebase_uid,
            nombre=data.nombre,
            nombre_usuario=data.nombre_usuario,
            email=data.email,
            tipo_dieta=data.tipo_dieta,
            imagen_url=data.imagen_url,
            contrasena=None
        )
        db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return usuario

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
    return db.query(models.PlantaCat).offset(skip).limit(limit).all()

def crear_planta_usuario(db: Session, planta: schemas.PUsuarioCreate, usuario_id: int):
    db_planta = models.PUsuario(**planta.model_dump(), usuario_id=usuario_id)
    db.add(db_planta)
    db.commit()
    db.refresh(db_planta)
    return db_planta

def get_plantas_usuario(db, usuario_id: int):
    return (
        db.query(models.PUsuario, models.PlantaCat)
        .join(models.PlantaCat, models.PUsuario.planta_id == models.PlantaCat.planta_id)
        .filter(models.PUsuario.usuario_id == usuario_id)
        .all()
    )