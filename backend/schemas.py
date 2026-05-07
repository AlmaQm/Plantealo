from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, time

# --- SCHEMAS DE USUARIO ---

class UsuarioBase(BaseModel):
    nombre: str
    nombre_usuario: str
    email: EmailStr
    tipo_dieta: Optional[str] = None
    imagen_url: Optional[str] = None

class UsuarioCreate(UsuarioBase):
    contrasena: str  # Solo se pide al crear el usuario

class Usuario(UsuarioBase):
    id: int

    class Config:
        from_attributes = True # Esto permite que Pydantic lea modelos de SQLAlchemy

# --- SCHEMAS DE PLANTA ---

class PlantaBase(BaseModel):
    nombre_planta: str
    f_siembra: date
    f_recogida: Optional[date] = None
    tipo_lugar: str
    estado: str
    clima: Optional[str] = None
    imagen_url: Optional[str] = None

class PlantaCreate(PlantaBase):
    pass # Para crear una planta pedimos lo básico

class Planta(PlantaBase):
    id: int
    usuario_id: int

    class Config:
        from_attributes = True