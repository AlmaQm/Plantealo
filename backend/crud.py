from sqlalchemy.orm import Session
from sqlalchemy import func, case, select, insert, delete, and_
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
from typing import List, Optional
import models
import schemas

# --- LÓGICA PARA USUARIOS ---

def get_usuario_by_email(db: Session, email: str):
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
    try:
        db.commit()
        db.refresh(usuario)
        return usuario
    except IntegrityError as e:
        db.rollback()
        detail = str(e.orig)
        if 'nombre_usuario' in detail:
            raise HTTPException(
                status_code=409,
                detail="El nombre de usuario ya está en uso"
            )
        if 'email' in detail:
            raise HTTPException(
                status_code=409,
                detail="El email ya está registrado"
            )
        raise HTTPException(status_code=409, detail="Conflicto de datos")

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
    try:
        db.commit()
        db.refresh(db_planta)
        return db_planta
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Esta planta ya está en tu inventario"
        )

def get_plantas_usuario(db, usuario_id: int):
    return (
        db.query(models.PUsuario, models.PlantaCat)
        .join(models.PlantaCat, models.PUsuario.planta_id == models.PlantaCat.planta_id)
        .filter(models.PUsuario.usuario_id == usuario_id)
        .all()
    )

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

def editar_publicacion(db: Session, publicacion_id: int, usuario_id: str, categoria: str, descripcion: str) -> models.Publicacion | None:
    db_pub = get_publicacion(db, publicacion_id)
    if not db_pub or db_pub.usuario_id != usuario_id:
        return None
    db_pub.categoria = categoria
    db_pub.descripcion = descripcion
    db.commit()
    db.refresh(db_pub)
    return db_pub

def eliminar_publicacion(db: Session, publicacion_id: int, usuario_id: str) -> bool:
    db_pub = get_publicacion(db, publicacion_id)
    if not db_pub or db_pub.usuario_id != usuario_id:
        return False
    db.delete(db_pub)
    db.commit()
    return True

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

# --- LÓGICA PARA PLANTAS (continuación) ---

def get_plantas_ids_usuario(db: Session, usuario_id: int) -> List[int]:
    filas = (
        db.query(models.PUsuario.planta_id)
        .filter(models.PUsuario.usuario_id == usuario_id)
        .distinct()
        .all()
    )
    return [id_planta for (id_planta,) in filas]

# --- NUEVO: CREAR PLANTA EN EL CATÁLOGO MAESTRO ---
def crear_planta_catalogo(db: Session, planta: schemas.PlantaCatCreate):
    # Inserta la planta directamente en la tabla PlantaCat (catálogo general)
    db_planta = models.PlantaCat(**planta.model_dump())
    db.add(db_planta)
    db.commit()
    db.refresh(db_planta)
    return db_planta

# --- LÓGICA PARA RECETAS (NIVEL 1: ¿QUÉ PUEDO COCINAR CON MI HUERTO? / FEED INTELIGENTE) ---

def _resultados_recetas_con_faltantes(db: Session, ids_plantas: List[int], usuario_id: Optional[int] = None):
    # Como 'plantas' e 'ingredientes' comparten IDs, ids_plantas se usa directamente
    # como el conjunto de id_ingrediente disponibles para el usuario.
    subquery = (
        db.query(
            models.receta_ingredientes.c.id_receta.label("id_receta"),
            func.count(models.receta_ingredientes.c.id_ingrediente).label("total_ingredientes"),
            func.sum(
                case(
                    (models.receta_ingredientes.c.id_ingrediente.in_(ids_plantas), 1),
                    else_=0
                )
            ).label("ingredientes_disponibles")
        )
        .group_by(models.receta_ingredientes.c.id_receta)
        .subquery()
    )

    # LEFT JOIN: una receta sin filas en receta_ingredientes no debe desaparecer del
    # resultado. Sin ingredientes asociados, total y disponibles son NULL tras el
    # outerjoin; coalesce los deja en 0, por lo que ingredientes_faltantes = 0.
    total_ingredientes = func.coalesce(subquery.c.total_ingredientes, 0)
    ingredientes_disponibles = func.coalesce(subquery.c.ingredientes_disponibles, 0)
    ingredientes_faltantes = (total_ingredientes - ingredientes_disponibles).label(
        "ingredientes_faltantes"
    )

    # LEFT JOIN con recetas_guardadas filtrando por usuario_id: si no hay coincidencia
    # (no la guardó, o usuario_id es None) la columna usuario_id llega NULL -> guardada=False.
    guardada = models.recetas_guardadas.c.usuario_id.isnot(None).label("guardada")

    return (
        db.query(models.Receta, ingredientes_faltantes, guardada)
        .outerjoin(subquery, models.Receta.id_receta == subquery.c.id_receta)
        .outerjoin(
            models.recetas_guardadas,
            and_(
                models.recetas_guardadas.c.id_receta == models.Receta.id_receta,
                models.recetas_guardadas.c.usuario_id == usuario_id
            )
        )
        .all()
    )

def _ingredientes_por_receta(db: Session, ids_recetas: List[int]) -> dict:
    if not ids_recetas:
        return {}

    filas = (
        db.query(
            models.receta_ingredientes.c.id_receta,
            models.Ingrediente.nombre_ingrediente,
            models.receta_ingredientes.c.cantidad,
            models.receta_ingredientes.c.id_ingrediente,
        )
        .join(models.Ingrediente, models.Ingrediente.id_ingrediente == models.receta_ingredientes.c.id_ingrediente)
        .filter(models.receta_ingredientes.c.id_receta.in_(ids_recetas))
        .all()
    )

    por_receta: dict = {}
    for id_receta, nombre, cantidad, id_ingrediente in filas:
        por_receta.setdefault(id_receta, []).append((nombre, cantidad, id_ingrediente))
    return por_receta

def _receta_a_schema_huerto(
    receta: models.Receta,
    faltantes: int,
    guardada: bool,
    ingredientes_receta: list,
    ids_disponibles: set,
) -> schemas.RecetaHuerto:
    ingredientes = [
        schemas.IngredienteEstado(
            nombre_ingrediente=nombre,
            cantidad=cantidad,
            disponible=id_ingrediente in ids_disponibles
        )
        for nombre, cantidad, id_ingrediente in ingredientes_receta
    ]

    return schemas.RecetaHuerto(
        id_receta=receta.id_receta,
        nombre_receta=receta.nombre_receta,
        descripcion=receta.descripcion,
        tipo_dieta=receta.tipo_dieta,
        estacion=receta.estacion,
        categoria=receta.categoria,
        tiempo_preparacion=receta.tiempo_preparacion,
        dificultad=receta.dificultad,
        num_comensales=receta.num_comensales,
        instrucciones=receta.instrucciones,
        tips=receta.tips,
        imagen_url=receta.imagen_url,
        ingredientes_faltantes=int(faltantes),
        guardada=bool(guardada),
        ingredientes=ingredientes
    )

def clasificar_recetas_por_huerto(
    db: Session, ids_plantas: List[int], usuario_id: Optional[int] = None
) -> schemas.ClasificacionRecetasResponse:
    resultados = _resultados_recetas_con_faltantes(db, ids_plantas, usuario_id)
    ids_disponibles = set(ids_plantas)
    ingredientes_por_receta = _ingredientes_por_receta(db, [r.id_receta for r, _, _ in resultados])

    puedes_cocinar = []
    te_falta_1 = []
    te_faltan_varios = []

    for receta, faltantes, guardada in resultados:
        receta_out = _receta_a_schema_huerto(
            receta, faltantes, guardada,
            ingredientes_por_receta.get(receta.id_receta, []),
            ids_disponibles
        )

        if receta_out.ingredientes_faltantes == 0:
            puedes_cocinar.append(receta_out)
        elif receta_out.ingredientes_faltantes == 1:
            te_falta_1.append(receta_out)
        else:
            te_faltan_varios.append(receta_out)

    return schemas.ClasificacionRecetasResponse(
        puedes_cocinar=puedes_cocinar,
        te_falta_1=te_falta_1,
        te_faltan_varios=te_faltan_varios
    )

def get_feed_recetas_inteligente(
    db: Session, ids_plantas: List[int], usuario_id: Optional[int] = None
) -> List[schemas.RecetaHuerto]:
    # Si el usuario no tiene plantas, se usa un ID ficticio para que el cálculo
    # de faltantes equivalga al total de ingredientes de cada receta.
    ids_comparacion = ids_plantas if ids_plantas else [-1]
    resultados = _resultados_recetas_con_faltantes(db, ids_comparacion, usuario_id)
    ids_disponibles = set(ids_comparacion)
    ingredientes_por_receta = _ingredientes_por_receta(db, [r.id_receta for r, _, _ in resultados])

    return [
        _receta_a_schema_huerto(
            receta, faltantes, guardada,
            ingredientes_por_receta.get(receta.id_receta, []),
            ids_disponibles
        )
        for receta, faltantes, guardada in resultados
    ]

# --- LÓGICA PARA RECETAS GUARDADAS ---

def guardar_receta(db: Session, usuario_id: int, id_receta: int):
    ya_guardada = db.execute(
        select(models.recetas_guardadas).where(
            models.recetas_guardadas.c.usuario_id == usuario_id,
            models.recetas_guardadas.c.id_receta == id_receta
        )
    ).first()

    if not ya_guardada:
        db.execute(
            insert(models.recetas_guardadas).values(usuario_id=usuario_id, id_receta=id_receta)
        )
        db.commit()

    return {"usuario_id": usuario_id, "id_receta": id_receta}

def desguardar_receta(db: Session, usuario_id: int, id_receta: int):
    db.execute(
        delete(models.recetas_guardadas).where(
            models.recetas_guardadas.c.usuario_id == usuario_id,
            models.recetas_guardadas.c.id_receta == id_receta
        )
    )
    db.commit()

def get_recetas_guardadas(db: Session, usuario_id: int):
    return (
        db.query(models.Receta)
        .join(models.recetas_guardadas, models.Receta.id_receta == models.recetas_guardadas.c.id_receta)
        .filter(models.recetas_guardadas.c.usuario_id == usuario_id)
        .all()
    )

# --- LÓGICA PARA CREAR RECETAS ---

def crear_receta_completa(db: Session, receta_in: schemas.RecetaCreate, usuario_id: int) -> models.Receta:
    db_receta = models.Receta(
        usuario_id=usuario_id,
        nombre_receta=receta_in.nombre_receta,
        descripcion=receta_in.descripcion,
        tipo_dieta=receta_in.tipo_dieta,
        estacion=receta_in.estacion,
        categoria=receta_in.categoria,
        tiempo_preparacion=receta_in.tiempo_preparacion,
        dificultad=receta_in.dificultad,
        num_comensales=receta_in.num_comensales,
        instrucciones=receta_in.instrucciones,
        tips=receta_in.tips,
        imagen_url=receta_in.imagen_url,
    )
    db.add(db_receta)
    db.flush()  # Genera el id_receta en PostgreSQL sin cerrar la transacción

    for item in receta_in.ingredientes:
        ingrediente = (
            db.query(models.Ingrediente)
            .filter(func.lower(models.Ingrediente.nombre_ingrediente) == item.nombre_ingrediente.lower())
            .first()
        )

        if ingrediente is None:
            print(f"[crear_receta_completa] Ingrediente no encontrado en el catálogo: '{item.nombre_ingrediente}' (se omite)")
            continue

        db.execute(
            insert(models.receta_ingredientes).values(
                id_receta=db_receta.id_receta,
                id_ingrediente=ingrediente.id_ingrediente,
                cantidad=item.cantidad
            )
        )

    db.commit()
    db.refresh(db_receta)
    return db_receta
