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
    planta_cat_id: int  # especie del catálogo (plantas.planta_id) que se está plantando

class PUsuario(PUsuarioBase):
    planta_id: int
    usuario_id: int
    planta_cat_id: Optional[int] = None
    class Config:
        from_attributes = True

# Planta Catálogo
class PlantaCatCreate(BaseModel):
    nombre_planta: str
    hortaliza: bool
    tipo_planta: str
    freq_riego: int
    imagen_url: Optional[str] = None
    clima: Optional[str] = None
    h_luzsolar: Optional[int] = None
    caracteristicas: Optional[str] = None

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

# --- Nivel 1: ¿Qué puedo cocinar con mi huerto? ---

class ConsultaHuertoRequest(BaseModel):
    ids_plantas: List[int]
    usuario_id: Optional[int] = None  # si se indica, marca guardada=True en las recetas que ya guardó

class RecetaBase(BaseModel):
    id_receta: int
    nombre_receta: str
    descripcion: Optional[str] = None
    tipo_dieta: Optional[str] = None
    estacion: Optional[str] = None
    categoria: Optional[str] = None
    tiempo_preparacion: Optional[time] = None
    dificultad: Optional[str] = None
    num_comensales: Optional[int] = None
    instrucciones: Optional[str] = None
    tips: Optional[str] = None
    imagen_url: Optional[str] = None
    class Config:
        from_attributes = True

class RecetaHuerto(RecetaBase):
    ingredientes_faltantes: int
    guardada: bool = False

class ClasificacionRecetasResponse(BaseModel):
    puedes_cocinar: List[RecetaHuerto]
    te_falta_1: List[RecetaHuerto]
    te_faltan_varios: List[RecetaHuerto]

# --- Creación de recetas ---

class IngredienteRecetaInput(BaseModel):
    nombre_ingrediente: str
    cantidad: str

class RecetaCreate(BaseModel):
    nombre_receta: str
    descripcion: Optional[str] = None
    tipo_dieta: Optional[str] = None
    estacion: Optional[str] = None
    categoria: Optional[str] = None
    tiempo_preparacion: Optional[time] = None
    dificultad: Optional[str] = None
    num_comensales: Optional[int] = None
    instrucciones: Optional[str] = None
    tips: Optional[str] = None
    imagen_url: Optional[str] = None
    ingredientes: List[IngredienteRecetaInput]