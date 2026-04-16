export interface Planta {
  nombre: string;
  fecha_inicio: Date;
  fecha_siembra: Date;
  clima_ideal: string;
  imagen: string;
  estado: 'plantado' | 'creciendo' | 'listo' | 'enfermo'; // Estados fijos
  tipo: 'interior' | 'exterior' | 'todas';
  notificaciones: boolean;
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
  titulo: string;
  autorUser: string;
  autorNombre: string;
  ingredientes: { nombre: string, cantidad: string, esDeHuerto: boolean }[];
  instrucciones: string[];
  tiempoPrep: number;
  imagen: string;
}