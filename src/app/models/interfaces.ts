export interface Planta {
  planta_id: number;
  usuario_id: number;
  nombre_planta: string;
  imagen_url: string;
  f_siembra: Date;
  f_recogida: Date;
  tipo_planta: 'INTERIOR' | 'EXTERIOR' | 'TODAS';
  estado_crecimiento: 'PLANTADA' | 'CRECIENDO' | 'LISTA';
  freq_riego: number;
  h_luzsolar: number;
  caracteristicas: string[];
  progreso: number;
}

export interface Usuario {
  usuarioid: string;
  nombre: string;
  email: string;
  tipo_dieta: 'vegana' | 'vegetariana' | 'omnivora';
  recetasGuardadasIds: string[];
}

export interface Post {
  autorUser: string;
  autorNombre: string;
  contenido: string;
  imagen: string;
  fecha: Date;
  tipo: 'planta' | 'receta';
  likes: number;
  comentarios: string;
}

export interface Receta {
  id:number;  
  titulo: string;
  autorUser: string;
  autorNombre: string;
  ingredientes: { nombre: string, cantidad: string, esDeHuerto: boolean }[];
  instrucciones: string[];
  tiempoPrep: number;
  imagen: string;
}
// per que tenim el nom del user qui? 
//idea interfaces krm

// src/app/models/interfaces.ts

export interface Usuario {
  usuarioid: string;
  nombre: string;
  email: string;
  tipo_dieta: 'vegana' | 'vegetariana' | 'omnivora';
  recetasGuardadasIds: string[];
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  category: 'entrante' | 'principal' | 'postre' | 'bebida' | 'salsa';
  type_dieta: ('vegana' | 'vegetariana' | 'omnivora')[];
  prepTime: number;
  difficulty: 'facil' | 'media' | 'dificil';
  servings: number;
  imageUrl: string;
  instructions: string[];
  ingredients: Ingredient[];
  tips?: string[];
  season?: ('primavera' | 'verano' | 'otoño' | 'invierno')[];
}

export interface Ingredient {
  name: string;
  measure: string;
  isFromGarden: boolean;
  gardenPlantMatch?: string; // nombre de la planta en el huerto si coincide
}


// Para la planta del huerto (simplificado)
export interface GardenPlant {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

