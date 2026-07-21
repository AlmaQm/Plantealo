from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, time, datetime

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

# Sincronización Firebase → Aiven (input desde el frontend, sin contraseña)
class UsuarioSync(BaseModel):
    firebase_uid: str
    nombre: str
    nombre_usuario: str
    email: EmailStr
    tipo_dieta: str
    imagen_url: Optional[str] = None

# Usuario de salida (incluye usuario_id y firebase_uid)
class UsuarioOut(BaseModel):
    usuario_id: int
    firebase_uid: Optional[str] = None
    nombre: str
    nombre_usuario: str
    email: EmailStr
    tipo_dieta: str
    imagen_url: Optional[str] = None
    class Config:
        from_attributes = True

# Planta Personal (p_usuario)
class PUsuarioBase(BaseModel):
    f_siembra: date
    f_recogida: Optional[date] = None
    estado_crecimiento: str

class PUsuarioCreate(PUsuarioBase):
    planta_id: int  # especie del catálogo (plantas.planta_id) que se está plantando

class PUsuario(PUsuarioBase):
    id: int
    planta_id: int
    usuario_id: int
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

# Planta personal del usuario + datos del catálogo (join p_usuario + plantas)
class PUsuarioDetall(BaseModel):
    planta_id: int
    usuario_id: int
    f_siembra: date
    f_recogida: Optional[date] = None
    estado_crecimiento: str
    # Camps del catàleg (PlantaCat)
    nombre_planta: str
    tipo_planta: str
    freq_riego: int
    imagen_url: Optional[str] = None
    clima: Optional[str] = None
    caracteristicas: Optional[str] = None
    class Config:
        from_attributes = True

# --- COMUNIDAD ---

class ComentarioCreate(BaseModel):
    usuario_id: str
    nombre_usuario: str
    username: str
    texto: str

class Comentario(BaseModel):
    comentario_id: int
    usuario_id: str
    nombre_usuario: str
    username: str
    texto: str
    fecha: datetime
    class Config:
        from_attributes = True

class PublicacionCreate(BaseModel):
    usuario_id: str
    nombre_usuario: str
    username: str
    avatar_inicial: str
    categoria: str
    descripcion: str
    imagen_url: Optional[str] = None

class Publicacion(BaseModel):
    publicacion_id: int
    usuario_id: str
    nombre_usuario: str
    username: str
    avatar_inicial: Optional[str] = None
    imagen_url: Optional[str] = None
    categoria: str
    descripcion: str
    fecha: datetime
    likes: int
    liked: bool
    comentarios: List[Comentario]
    class Config:
        from_attributes = True

class PublicacionEdit(BaseModel):
    usuario_id: str
    categoria: str
    descripcion: str

class LikeToggle(BaseModel):
    usuario_id: str

class ImagenUpdate(BaseModel):
    imagen_url: str

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

class IngredienteEstado(BaseModel):
    nombre_ingrediente: str
    cantidad: Optional[str] = None
    disponible: bool

class RecetaHuerto(RecetaBase):
    ingredientes_faltantes: int
    guardada: bool = False
    ingredientes: List[IngredienteEstado] = []

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
