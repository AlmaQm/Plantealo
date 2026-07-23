export interface GardenTask {
  id: number;
  tipo: 'RIEGO' | 'COSECHA' | 'ENFERMA';
  icon: string;
  image: string;
  title: string;
  description: string;
  completed: boolean;
}
export interface WeatherData {
   temp: number;
   condition: string;
   humidity: number;
   advice: string;
}

export interface Planta {
  planta_id: number;
  usuario_id: number;
  nombre_planta: string;
  imagen_url: string;
  f_siembra: Date;
  f_recogida: Date;
  tipo_planta: 'INTERIOR' | 'EXTERIOR' | 'TODAS' | 'HUERTO';
  estado: 'PLANTADA' | 'CRECIENDO' | 'LISTA' | 'ENFERMA';
  clima?: string;
  freq_riego?: number;
  caracteristicas?: string;
  ultimo_riego?: Date | null;
  f_cosecha?: Date | null;
}

export interface Recipe {
  id_receta: number;
  usuario_id?: number;
  nombre_receta: string;
  descripcion: string;
  categoria: 'ENTRANTE' | 'PRINCIPAL' | 'POSTRE' | 'BEBIDA';
  tipo_dieta: 'OMNIVORA' | 'VEGETARIANA' | 'VEGANA';
  tiempo_preparacion: number;
  dificultad: 'FACIL' | 'MEDIA' | 'DIFICL';
  num_comensales: number;
  imagen_url: string;
  instrucciones: string[];
  ingredientes: Ingrediente[];
  tips?: string;
  estacion?: 'PRIMAVERA' | 'VERANO' | 'OTOÑO' | 'INVIERNO';
}

export interface Ingrediente {
  nombre_ingrediente: string;
  cantidad: string;
  isFromGarden?: boolean;
  gardenPlantMatch?: string;
}

export interface Usuario {
  uid: string;
  usuario_id?: number;   // ← nou: ID numèric d'Aiven
  nombre: string;
  nombre_usuario: string;
  email: string;
  tipo_dieta: 'OMNIVORA' | 'VEGETARIANA' | 'VEGANA';
  imagen_url?: string;
  fechaRegistro?: Date;
}

export interface GardenPlant {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface Comentario {
  comentario_id: string;
  usuario_id: string;
  nombre_usuario: string;
  username: string;
  texto: string;
  fecha: Date;
}

export interface Publicacion {
  publicacion_id: string;
  usuario_id: string;
  nombre_usuario: string;
  username: string;
  avatar_inicial: string;
  imagen_url: string;
  categoria: 'HUERTO' | 'RECETA' | 'CONSEJO' | 'COSECHA';
  descripcion: string;
  likes: number;
  liked: boolean;
  guardada: boolean;
  comentarios: Comentario[];
  fecha: Date;
  siguiendo: boolean;
}

// --- API Backend (FastAPI) — Recetas ---

export interface RecetaBase {
  id_receta: number;
  nombre_receta: string;
  descripcion?: string;
  tipo_dieta?: string;
  estacion?: string;
  categoria?: string;
  tiempo_preparacion?: string;
  dificultad?: string;
  num_comensales?: number;
  instrucciones?: string;
  tips?: string;
  imagen_url?: string;
}

export interface IngredienteEstado {
  nombre_ingrediente: string;
  cantidad?: string;
  disponible: boolean;
}

export interface RecetaHuerto extends RecetaBase {
  ingredientes_faltantes: number;
  guardada?: boolean;
  ingredientes?: IngredienteEstado[];
}

export interface ConsultaHuertoRequest {
  ids_plantas: number[];
  usuario_id?: number;
}

export interface ClasificacionRecetasResponse {
  puedes_cocinar: RecetaHuerto[];
  te_falta_1: RecetaHuerto[];
  te_faltan_varios: RecetaHuerto[];
}

export interface IngredienteRecetaInput {
  nombre_ingrediente: string;
  cantidad: string;
}

export interface RecetaCreate {
  nombre_receta: string;
  descripcion?: string;
  tipo_dieta?: string;
  estacion?: string;
  categoria?: string;
  tiempo_preparacion?: string;
  dificultad?: string;
  num_comensales?: number;
  instrucciones?: string;
  tips?: string;
  imagen_url?: string;
  ingredientes: IngredienteRecetaInput[];
}
