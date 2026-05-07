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
  usuario_id: string;
  nombre: string;
  email: string;
  tipo_dieta: 'VEGANA' | 'VEGETARIANA' | 'OMNIVORA';
  recetasGuardadasIds: string[];
}

export interface GardenPlant {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}
