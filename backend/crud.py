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
    return db.query(models.PlantaCat).offset(skip).limit(limit).all()

def crear_planta_usuario(db: Session, planta: schemas.PUsuarioCreate, usuario_id: int):
    db_planta = models.PUsuario(**planta.model_dump(), usuario_id=usuario_id)
    db.add(db_planta)
    db.commit()
    db.refresh(db_planta)
    return db_planta

# --- LÓGICA PARA COMUNIDAD ---

def serializar_publicacion(pub: models.Publicacion, uid: str | None) -> schemas.Publicacion:
    return schemas.Publicacion(
        publicacion_id=pub.publicacion_id,
        usuario_id=pub.usuario_id,
        nombre_usuario=pub.nombre_usuario,
        username=pub.username,
        avatar_inicial=pub.avatar_inicial,
        imagen_url=pub.imagen_url,
        categoria=pub.categoria,
        descripcion=pub.descripcion,
        fecha=pub.fecha,
        likes=len(pub.likes),
        liked=any(l.usuario_id == uid for l in pub.likes) if uid else False,
        comentarios=pub.comentarios,
    )

def listar_publicaciones(db: Session, uid: str | None = None) -> list[schemas.Publicacion]:
    pubs = db.query(models.Publicacion).order_by(models.Publicacion.fecha.desc()).all()
    return [serializar_publicacion(p, uid) for p in pubs]

def get_publicacion(db: Session, publicacion_id: int) -> models.Publicacion | None:
    return db.query(models.Publicacion).filter(models.Publicacion.publicacion_id == publicacion_id).first()

def crear_publicacion(db: Session, publicacion: schemas.PublicacionCreate) -> schemas.Publicacion:
    db_pub = models.Publicacion(**publicacion.model_dump())
    db.add(db_pub)
    db.commit()
    db.refresh(db_pub)
    return serializar_publicacion(db_pub, publicacion.usuario_id)

def actualizar_imagen_publicacion(db: Session, publicacion_id: int, imagen_url: str) -> models.Publicacion | None:
    db_pub = get_publicacion(db, publicacion_id)
    if not db_pub:
        return None
    db_pub.imagen_url = imagen_url
    db.commit()
    db.refresh(db_pub)
    return db_pub

def toggle_like(db: Session, publicacion_id: int, usuario_id: str) -> schemas.Publicacion | None:
    db_pub = get_publicacion(db, publicacion_id)
    if not db_pub:
        return None
    existente = db.query(models.PublicacionLike).filter(
        models.PublicacionLike.publicacion_id == publicacion_id,
        models.PublicacionLike.usuario_id == usuario_id
    ).first()
    if existente:
        db.delete(existente)
    else:
        db.add(models.PublicacionLike(publicacion_id=publicacion_id, usuario_id=usuario_id))
    db.commit()
    db.refresh(db_pub)
    return serializar_publicacion(db_pub, usuario_id)

def crear_comentario(db: Session, publicacion_id: int, comentario: schemas.ComentarioCreate) -> schemas.Publicacion | None:
    db_pub = get_publicacion(db, publicacion_id)
    if not db_pub:
        return None
    db_comentario = models.Comentario(publicacion_id=publicacion_id, **comentario.model_dump())
    db.add(db_comentario)
    db.commit()
    db.refresh(db_pub)
    return serializar_publicacion(db_pub, comentario.usuario_id)