from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Date, Text, Enum, Time, Table
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
    nombre = Column(String(50), nullable=False)
    nombre_usuario = Column(String(30), unique=True, nullable=False)
    email = Column(String(50), unique=True, nullable=False)
    contrasena = Column(String(255), nullable=False)
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
    planta_id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuario.usuario_id"))
    f_siembra = Column(Date, nullable=False)
    f_recogida = Column(Date)
    estado_crecimiento = Column(String(20)) # PLANTADA, CRECIENDO, LISTA
    
    propietario = relationship("Usuario", back_populates="mis_plantas")

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

class Ingrediente(Base):
    __tablename__ = "ingredientes"
    id_ingrediente = Column(Integer, primary_key=True, index=True)
    nombre_ingrediente = Column(String(50), nullable=False)
    cantidad = Column(String(20))
    imagen_url = Column(String(100))
    tipo_dieta = Column(String(20))