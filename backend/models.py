from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Date, DateTime, Text, Enum, Time, Table, func, UniqueConstraint
from sqlalchemy.orm import relationship
from database import Base

# --- TABLAS INTERMEDIAS ---

seguidores = Table(
    'seguidores',
    Base.metadata,
    Column('seguidor_id', Integer, ForeignKey('usuario.usuario_id'), primary_key=True),
    Column('seguido_id', Integer, ForeignKey('usuario.usuario_id'), primary_key=True)
)

recetas_guardadas = Table(
    'recetas_guardadas',
    Base.metadata,
    Column('usuario_id', Integer, ForeignKey('usuario.usuario_id', ondelete="CASCADE"), primary_key=True),
    Column('id_receta', Integer, ForeignKey('recetas.id_receta', ondelete="CASCADE"), primary_key=True)
)

receta_ingredientes = Table(
    'receta_ingredientes',
    Base.metadata,
    Column('id_receta', Integer, ForeignKey('recetas.id_receta', ondelete="CASCADE"), primary_key=True),
    Column('id_ingrediente', Integer, ForeignKey('ingredientes.id_ingrediente', ondelete="CASCADE"), primary_key=True),
    Column('cantidad', String(30))
)

# --- MODELOS ---

class Usuario(Base):
    __tablename__ = "usuario"
    usuario_id = Column(Integer, primary_key=True, index=True)
    firebase_uid = Column(String(128), unique=True, index=True, nullable=True)
    nombre = Column(String(50), nullable=False)
    nombre_usuario = Column(String(30), unique=True, nullable=False)
    email = Column(String(50), unique=True, nullable=False)
    contrasena = Column(String(255), nullable=True)  # ya era nullable en la BD (Firebase gestiona auth)
    tipo_dieta = Column(String(20), nullable=False) # OMNIVORA, VEGETARIANA, VEGANA
    imagen_url = Column(String(100))

    perfil = relationship("PerfilUsuario", back_populates="usuario", uselist=False)
    mis_plantas = relationship("PUsuario", back_populates="propietario")

class PerfilUsuario(Base):
    __tablename__ = "perfil_usuario"
    usuario_id = Column(Integer, ForeignKey("usuario.usuario_id"), primary_key=True)
    nombre_usuario = Column(String(30), unique=True)
    tipo_dieta = Column(String(20))
    biografia = Column(String(200))
    usuario = relationship("Usuario", back_populates="perfil")

class PlantaCat(Base): # El catálogo (Interfaces)
    __tablename__ = "plantas"
    planta_id = Column(Integer, primary_key=True, index=True)
    nombre_planta = Column(String(50), nullable=False)
    hortaliza = Column(Boolean, default=True)
    imagen_url = Column(String(100))
    tipo_planta = Column(String(20)) # INTERIOR, EXTERIOR
    freq_riego = Column(Integer)
    clima = Column(String(20))
    h_luzsolar = Column(Integer)
    caracteristicas = Column(String(50))

class PUsuario(Base): # La planta personal del usuario
    __tablename__ = "p_usuario"
    # Esquema alineado con feature/plantas-mejoras (ya aplicado en Aiven):
    # 'id' es la PK real; 'planta_id' es la especie del catálogo (FK a plantas.planta_id),
    # con UNIQUE(planta_id, usuario_id) para que un usuario no repita especie pero
    # distintos usuarios sí puedan tener la misma planta.
    id = Column(Integer, primary_key=True, autoincrement=True)
    planta_id = Column(Integer, ForeignKey("plantas.planta_id"), nullable=False, index=True)
    usuario_id = Column(Integer, ForeignKey("usuario.usuario_id"), nullable=False)
    f_siembra = Column(Date, nullable=False)
    f_recogida = Column(Date)
    estado_crecimiento = Column(String(20)) # PLANTADA, CRECIENDO, LISTA
    ultimo_riego = Column(Date, nullable=True)
    f_cosecha = Column(Date, nullable=True)

    __table_args__ = (
        UniqueConstraint('planta_id', 'usuario_id', name='uq_p_usuario_planta_usuario'),
    )

    propietario = relationship("Usuario", back_populates="mis_plantas")
    especie = relationship("PlantaCat")

class Receta(Base):
    __tablename__ = "recetas"
    id_receta = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuario.usuario_id"))
    nombre_receta = Column(String(50), nullable=False)
    descripcion = Column(String(80))
    tipo_dieta = Column(String(20))
    estacion = Column(String(20))
    categoria = Column(String(20))
    tiempo_preparacion = Column(Time)
    dificultad = Column(String(20))
    num_comensales = Column(Integer)
    instrucciones = Column(Text)
    tips = Column(String(50))
    imagen_url = Column(String(100))

    ingredientes = relationship("Ingrediente", secondary=receta_ingredientes, backref="recetas")

class Ingrediente(Base):
    __tablename__ = "ingredientes"
    id_ingrediente = Column(Integer, primary_key=True, index=True)
    nombre_ingrediente = Column(String(50), nullable=False)
    cantidad = Column(String(20))
    imagen_url = Column(String(100))
    tipo_dieta = Column(String(20))

# --- COMUNIDAD ---
# usuario_id aqui es el uid de Firebase Auth (string), no el usuario_id de la
# tabla Usuario: la comunidad solo usa Firebase para identificar al autor,
# los datos de la publicacion se guardan siempre en esta base de datos.

class Publicacion(Base):
    __tablename__ = "publicaciones"
    publicacion_id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(String(128), nullable=False, index=True)
    nombre_usuario = Column(String(50), nullable=False)
    username = Column(String(50), nullable=False)
    avatar_inicial = Column(String(5))
    imagen_url = Column(Text)
    categoria = Column(String(20), nullable=False)
    descripcion = Column(Text, nullable=False)
    fecha = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    likes = relationship("PublicacionLike", back_populates="publicacion", cascade="all, delete-orphan")
    guardados = relationship("PublicacionGuardada", back_populates="publicacion", cascade="all, delete-orphan")
    comentarios = relationship("Comentario", back_populates="publicacion", cascade="all, delete-orphan", order_by="Comentario.fecha")

class PublicacionLike(Base):
    __tablename__ = "publicacion_likes"
    publicacion_id = Column(Integer, ForeignKey("publicaciones.publicacion_id", ondelete="CASCADE"), primary_key=True)
    usuario_id = Column(String(128), primary_key=True)

    publicacion = relationship("Publicacion", back_populates="likes")

class PublicacionGuardada(Base):
    __tablename__ = "publicaciones_guardadas"
    publicacion_id = Column(Integer, ForeignKey("publicaciones.publicacion_id", ondelete="CASCADE"), primary_key=True)
    usuario_id = Column(String(128), primary_key=True)

    publicacion = relationship("Publicacion", back_populates="guardados")

class Comentario(Base):
    __tablename__ = "comentarios"
    comentario_id = Column(Integer, primary_key=True, index=True)
    publicacion_id = Column(Integer, ForeignKey("publicaciones.publicacion_id", ondelete="CASCADE"), nullable=False)
    usuario_id = Column(String(128), nullable=False)
    nombre_usuario = Column(String(50), nullable=False)
    username = Column(String(50), nullable=False)
    texto = Column(Text, nullable=False)
    fecha = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    publicacion = relationship("Publicacion", back_populates="comentarios")