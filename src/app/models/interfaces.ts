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

export interface UserGarden {
  ingredients: string[]; 
}

export interface Ingredient {
  name: string;
  quantity?: string;
}

// API Response interfaces
export interface MealAPIResponse {
  meals: MealAPI[] | null;
}
// idea interfaces carme
export interface MealAPI {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  strTags: string | null;
  strYoutube: string | null;
  strIngredient1: string | null;
  strIngredient2: string | null;
  strIngredient3: string | null;
  strIngredient4: string | null;
  strIngredient5: string | null;
  strIngredient6: string | null;
  strIngredient7: string | null;
  strIngredient8: string | null;
  strIngredient9: string | null;
  strIngredient10: string | null;
  strIngredient11: string | null;
  strIngredient12: string | null;
  strIngredient13: string | null;
  strIngredient14: string | null;
  strIngredient15: string | null;
  strIngredient16: string | null;
  strIngredient17: string | null;
  strIngredient18: string | null;
  strIngredient19: string | null;
  strIngredient20: string | null;
  strMeasure1: string | null;
  strMeasure2: string | null;
  strMeasure3: string | null;
  strMeasure4: string | null;
  strMeasure5: string | null;
  strMeasure6: string | null;
  strMeasure7: string | null;
  strMeasure8: string | null;
  strMeasure9: string | null;
  strMeasure10: string | null;
  strMeasure11: string | null;
  strMeasure12: string | null;
  strMeasure13: string | null;
  strMeasure14: string | null;
  strMeasure15: string | null;
  strMeasure16: string | null;
  strMeasure17: string | null;
  strMeasure18: string | null;
  strMeasure19: string | null;
  strMeasure20: string | null;
}

// Nuestra receta transformada
export interface Recipe {
  id: string;
  name: string;
  category: string;
  area: string;
  instructions: string;
  imageUrl: string;
  tags: string[];
  youtubeUrl: string | null;
  ingredients: Ingredient[];
  isVegetarian: boolean;
  prepTime?: string;
}

export interface Ingredient {
  name: string;
  measure: string;
  isFromGarden: boolean;
}

// Para la planta del huerto (simplificado)
export interface GardenPlant {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface RecipeFilter {
  vegetarianOnly: boolean;
  maxTime?: number;
  searchTerm?: string;
}