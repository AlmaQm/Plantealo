from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Date, DateTime, Text, Enum, Time, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base # Asegúrate de tener configurado database.py

# --- TABLAS INTERMEDIAS (Muchos a Muchos) ---

recetas_guardadas = Table(
    'recetas_guardadas',
    Base.metadata,
    Column('usuario_id', Integer, ForeignKey('usuarios.id', ondelete="CASCADE"), primary_key=True),
    Column('receta_id', Integer, ForeignKey('recetas.id', ondelete="CASCADE"), primary_key=True)
)

seguidores = Table(
    'seguidores',
    Base.metadata,
    Column('seguidor_id', Integer, ForeignKey('usuarios.id', ondelete="CASCADE"), primary_key=True),
    Column('seguido_id', Integer, ForeignKey('usuarios.id', ondelete="CASCADE"), primary_key=True)
)

receta_ingredientes = Table(
    'receta_ingredientes',
    Base.metadata,
    Column('receta_id', Integer, ForeignKey('recetas.id', ondelete="CASCADE"), primary_key=True),
    Column('ingrediente_id', Integer, ForeignKey('ingredientes.id', ondelete="CASCADE"), primary_key=True),
    Column('cantidad', String(50))
)

# --- MODELOS PRINCIPALES ---

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), nullable=False)
    nombre_usuario = Column(String(30), unique=True, nullable=False)
    email = Column(String(50), unique=True, nullable=False)
    contrasena = Column(String(255), nullable=False)
    tipo_dieta = Column(String(20)) # O usar Enum de SQLAlchemy
    imagen_url = Column(String(100))

    # Relaciones
    perfil = relationship("PerfilUsuario", back_populates="usuario", uselist=False)
    plantas = relationship("Planta", back_populates="propietario")
    recetas_propias = relationship("Receta", back_populates="creador")
    guardadas = relationship("Receta", secondary=recetas_guardadas)

class PerfilUsuario(Base):
    __tablename__ = "perfiles"

    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), primary_key=True)
    biografia = Column(String(200))
    usuario = relationship("Usuario", back_populates="perfil")

class Planta(Base):
    __tablename__ = "plantas"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"))
    nombre_planta = Column(String(50), nullable=False)
    f_siembra = Column(Date, nullable=False)
    f_recogida = Column(Date)
    tipo_lugar = Column(String(20)) # Interior/Exterior
    estado = Column(String(20))
    clima = Column(String(20))
    imagen_url = Column(String(100))

    propietario = relationship("Usuario", back_populates="plantas")

class Receta(Base):
    __tablename__ = "recetas"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"))
    nombre_receta = Column(String(50), nullable=False)
    descripcion = Column(String(100))
    instrucciones = Column(Text)
    tiempo_preparacion = Column(Time)
    dificultad = Column(String(20))
    imagen_url = Column(String(100))

    creador = relationship("Usuario", back_populates="recetas_propias")
    ingredientes = relationship("Ingrediente", secondary=receta_ingredientes, back_populates="en_recetas")

class Ingrediente(Base):
    __tablename__ = "ingredientes"

    id = Column(Integer, primary_key=True, index=True)
    nombre_ingrediente = Column(String(50), unique=True, nullable=False)
    imagen_url = Column(String(100))

    en_recetas = relationship("Receta", secondary=receta_ingredientes, back_populates="ingredientes")