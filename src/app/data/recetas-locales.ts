// src/app/data/recetas-locales.ts

import { Recipe } from '../models/interfaces';

export const RECETAS_LOCALES: Recipe[] = [
  {
    id: '1',
    name: 'Bowl Vegetariano con Lechugas y Hierbas',
    description: 'Un bowl fresco y nutritivo con ingredientes directos de tu huerto',
    category: 'principal',
    type_dieta: ['vegetariana', 'vegana', 'omnivora'],
    prepTime: 20,
    difficulty: 'facil',
    servings: 2,
    imageUrl: 'assets/images/bowl-vegetariano.jpg', // o URL de placeholder
    instructions: [
      'Lava y corta las lechugas en trozos pequeños',
      'Pica finamente las hierbas frescas (perejil, cilantro, albahaca)',
      'Cocina la quinoa o arroz según instrucciones del paquete',
      'En un bowl, coloca la base de lechugas',
      'Añade la quinoa, los tomates cherry cortados por la mitad',
      'Decora con las hierbas y aliña al gusto'
    ],
    ingredients: [
      { name: 'lechuga', measure: '2 tazas', isFromGarden: false },
      { name: 'tomate cherry', measure: '10 unidades', isFromGarden: false },
      { name: 'pepino', measure: '1/2 unidad', isFromGarden: false },
      { name: 'albahaca', measure: 'al gusto', isFromGarden: false },
      { name: 'perejil', measure: 'al gusto', isFromGarden: false },
      { name: 'quinoa', measure: '1 taza', isFromGarden: false },
      { name: 'aceite de oliva', measure: '2 cucharadas', isFromGarden: false },
      { name: 'limón', measure: '1 unidad', isFromGarden: false }
    ],
    tips: [
      'Puedes añadir aguacate para hacerlo más cremoso',
      'Si tienes rábanos en el huerto, quedan genial'
    ],
    season: ['primavera', 'verano']
  },
  {
    id: '2',
    name: 'Ensalada Caprese con Tomates del Huerto',
    description: 'La clásica ensalada italiana, perfecta cuando tus tomates están en su punto',
    category: 'entrante',
    type_dieta: ['vegetariana', 'omnivora'],
    prepTime: 15,
    difficulty: 'facil',
    servings: 2,
    imageUrl: 'assets/images/ensalada-carpese.jpg',
    instructions: [
      'Lava y corta los tomates en rodajas de 1cm',
      'Corta la mozzarella en rodajas del mismo grosor',
      'Alterna rodajas de tomate y mozzarella en un plato',
      'Espolvorea hojas de albahaca fresca',
      'Aliña con aceite de oliva, sal y pimienta al gusto',
      'Añade un chorrito de vinagre balsámico si deseas'
    ],
    ingredients: [
      { name: 'tomate', measure: '3 unidades grandes', isFromGarden: false },
      { name: 'albahaca', measure: '1 puñado', isFromGarden: false },
      { name: 'mozzarella', measure: '200g', isFromGarden: false },
      { name: 'aceite de oliva', measure: '3 cucharadas', isFromGarden: false },
      { name: 'vinagre balsámico', measure: '1 cucharada', isFromGarden: false },
      { name: 'sal', measure: 'al gusto', isFromGarden: false },
      { name: 'pimienta', measure: 'al gusto', isFromGarden: false }
    ],
    tips: [
      'Usa tomates recién cogidos del huerto, marcan la diferencia',
      'La mozzarella de búfala es la mejor opción'
    ],
    season: ['verano']
  },
  {
    id: '3',
    name: 'Salsa Verde con Hierbas Frescas',
    description: 'Salsa versátil para acompañar pastas, carnes o vegetales',
    category: 'salsa',
    type_dieta: ['vegana', 'vegetariana', 'omnivora'],
    prepTime: 8,
    difficulty: 'facil',
    servings: 6,
    imageUrl: 'assets/images/salsa-verde.jpg',
    instructions: [
      'Lava bien todas las hierbas',
      'Pela los dientes de ajo',
      'En una licuadora, coloca todas las hierbas, los ajos y el aceite',
      'Añade el jugo de limón y sal al gusto',
      'Licúa hasta obtener una salsa homogénea',
      'Ajusta la consistencia con más aceite si es necesario'
    ],
    ingredients: [
      { name: 'perejil', measure: '1 taza', isFromGarden: false },
      { name: 'cilantro', measure: '1/2 taza', isFromGarden: false },
      { name: 'albahaca', measure: '1/2 taza', isFromGarden: false },
      { name: 'menta', measure: '1/4 taza', isFromGarden: false },
      { name: 'ajo', measure: '2 dientes', isFromGarden: false },
      { name: 'aceite de oliva', measure: '1/2 taza', isFromGarden: false },
      { name: 'limón', measure: '1 unidad', isFromGarden: false }
    ],
    tips: [
      'Conserva en frasco de vidrio en la nevera hasta 1 semana',
      'Ideal para adobar carnes a la parrilla'
    ],
    season: ['primavera', 'verano', 'otoño']
  },
  {
    id: '4',
    name: 'Gazpacho Andaluz',
    description: 'Sopa fría perfecta para los calurosos días de verano',
    category: 'entrante',
    type_dieta: ['vegana', 'vegetariana', 'omnivora'],
    prepTime: 15,
    difficulty: 'facil',
    servings: 4,
    imageUrl: 'assets/images/gazpachoç.jpg',
    instructions: [
      'Lava bien todas las verduras',
      'Corta en trozos grandes: tomates, pepino, pimiento y cebolla',
      'Pela los dientes de ajo',
      'Coloca todo en la batidora junto con el aceite, vinagre y sal',
      'Bate hasta obtener una textura fina',
      'Pasa por un colador si quieres más fino',
      'Enfría en la nevera al menos 2 horas antes de servir'
    ],
    ingredients: [
      { name: 'tomate', measure: '1kg', isFromGarden: false },
      { name: 'pepino', measure: '1 unidad', isFromGarden: false },
      { name: 'pimiento verde', measure: '1 unidad', isFromGarden: false },
      { name: 'cebolla', measure: '1/2 unidad', isFromGarden: false },
      { name: 'ajo', measure: '2 dientes', isFromGarden: false },
      { name: 'aceite de oliva', measure: '100ml', isFromGarden: false },
      { name: 'vinagre de vino', measure: '2 cucharadas', isFromGarden: false }
    ],
    tips: [
      'Cuanto más maduros los tomates, mejor sabor',
      'Tradicionalmente se sirve con taquitos de jamón y huevo duro'
    ],
    season: ['verano']
  },
  {
    id: '5',
    name: 'Agua Refrescante de Menta y Pepino',
    description: 'Bebida hidratante y refrescante con ingredientes del huerto',
    category: 'bebida',
    type_dieta: ['vegana', 'vegetariana', 'omnivora'],
    prepTime: 5,
    difficulty: 'facil',
    servings: 4,
    imageUrl: 'assets/images/agua-pepino.jpg',
    instructions: [
      'Lava bien el pepino y la menta',
      'Corta el pepino en rodajas finas',
      'En una jarra grande, añade el pepino y las hojas de menta',
      'Añade el jugo de limón y el agua',
      'Endulza si deseas con miel o azúcar',
      'Deja reposar en nevera 30 minutos para que se integren los sabores'
    ],
    ingredients: [
      { name: 'pepino', measure: '1 unidad', isFromGarden: false },
      { name: 'menta', measure: '10 hojas', isFromGarden: false },
      { name: 'limón', measure: '2 unidades', isFromGarden: false },
      { name: 'agua', measure: '2 litros', isFromGarden: false },
      { name: 'miel', measure: 'opcional', isFromGarden: false }
    ],
    tips: [
      'Puedes añadir jengibre para un toque picante',
      'Ideal para servir en una jarra de vidrio con hielo'
    ],
    season: ['primavera', 'verano']
  },
  {
    id: '6',
    name: 'Pesto de Albahaca Casero',
    description: 'Salsa italiana clásica, perfecta para pastas',
    category: 'salsa',
    type_dieta: ['vegetariana', 'omnivora'],
    prepTime: 10,
    difficulty: 'facil',
    servings: 4,
    imageUrl: 'assets/images/pesto.jpg',
    instructions: [
      'Lava y seca bien las hojas de albahaca',
      'En un mortero o procesador, machaca los piñones y el ajo',
      'Añade la albahaca y sigue machacando',
      'Incorpora el queso parmesano rallado',
      'Añade el aceite de oliva poco a poco mientras mezclas',
      'Salpimienta al gusto'
    ],
    ingredients: [
      { name: 'albahaca', measure: '2 tazas', isFromGarden: false },
      { name: 'piñones', measure: '50g', isFromGarden: false },
      { name: 'queso parmesano', measure: '50g', isFromGarden: false },
      { name: 'ajo', measure: '2 dientes', isFromGarden: false },
      { name: 'aceite de oliva', measure: '1/2 taza', isFromGarden: false },
      { name: 'sal', measure: 'al gusto', isFromGarden: false }
    ],
    tips: [
      'El mortero tradicional da mejor textura que la batidora',
      'Congela el pesto en cubiteras para porciones pequeñas'
    ],
    season: ['primavera', 'verano']
  }
];