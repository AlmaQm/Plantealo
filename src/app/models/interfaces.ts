export interface GardenTask {
  id: number;
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
  tipo_planta: 'INTERIOR' | 'EXTERIOR' | 'TODAS';
  estado: 'PLANTADA' | 'CRECIENDO' | 'LISTA' | 'ENFERMA';
  clima?: string;
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
  comentario_id: number;
  usuario_id: number;
  nombre_usuario: string;
  username: string;
  texto: string;
  fecha: Date;
}

export interface Publicacion {
  publicacion_id: number;
  usuario_id: number;
  nombre_usuario: string;
  username: string;
  avatar_inicial: string;
  imagen_url: string;
  categoria: 'HUERTO' | 'RECETA' | 'CONSEJO' | 'COSECHA';
  descripcion: string;
  likes: number;
  liked: boolean;
  comentarios: Comentario[];
  fecha: Date;
  siguiendo: boolean;
}
