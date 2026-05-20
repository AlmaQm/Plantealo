from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, time

# Usuario
class UsuarioBase(BaseModel):
    nombre: str
    nombre_usuario: str
    email: EmailStr
    tipo_dieta: str
    imagen_url: Optional[str] = None

class UsuarioCreate(UsuarioBase):
    contrasena: str

class Usuario(UsuarioBase):
    usuario_id: int
    class Config:
        from_attributes = True

# Planta Personal (p_usuario)
class PUsuarioBase(BaseModel):
    f_siembra: date
    f_recogida: Optional[date] = None
    estado_crecimiento: str

class PUsuarioCreate(PUsuarioBase):
    pass

class PUsuario(PUsuarioBase):
    planta_id: int
    usuario_id: int
    class Config:
        from_attributes = True

# Planta Catálogo
class PlantaCat(BaseModel):
    planta_id: int
    nombre_planta: str
    hortaliza: bool
    tipo_planta: str
    freq_riego: int
    imagen_url: Optional[str] = None
    clima: Optional[str] = None
    h_luzsolar: Optional[int] = None
    caracteristicas: Optional[str] = None
    class Config:
        from_attributes = True