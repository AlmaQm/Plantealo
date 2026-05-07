// src/app/data/recetas-locales.ts

import { Recipe } from '../models/interfaces';

export const RECETAS_LOCALES: Recipe[] = [
  {
    id: '1',
    name: 'Bowl Vegetariano con Lechugas y Hierbas',
    description: 'Un bowl fresco y nutritivo con ingredientes directos de tu huerto',
    category: 'principal',
    type_dieta: ['vegana', 'vegetariana'],
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
    type_dieta: ['vegetariana'],
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
    type_dieta: ['vegana', 'vegetariana'],
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
    type_dieta: ['vegana', 'vegetariana'],
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
    type_dieta: ['vegana', 'vegetariana'],
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
    type_dieta: ['vegetariana'],
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
  },
  {
    id: '7',
    name: 'Pollo al Romero con Verduras del Huerto',
    description: 'Pollo jugoso marinado con romero fresco y acompañado de pimientos y zanahoria',
    category: 'principal',
    type_dieta: ['omnivora'],
    prepTime: 45,
    difficulty: 'media',
    servings: 4,
    imageUrl: 'assets/images/pollo-romero.jpg',
    instructions: [
      'Mezcla aceite, romero picado, tomillo, ajo y sal para la marinada',
      'Marina el pollo al menos 30 minutos',
      'Corta pimientos y zanahoria en trozos medianos',
      'Dora el pollo en sartén a fuego alto 3 min por lado',
      'Añade las verduras y hornea a 200°C durante 25 minutos',
      'Espolvorea perejil fresco antes de servir'
    ],
    ingredients: [
      { name: 'pollo', measure: '4 muslos', isFromGarden: false },
      { name: 'romero', measure: '3 ramas', isFromGarden: false },
      { name: 'tomillo', measure: '2 ramas', isFromGarden: false },
      { name: 'pimiento', measure: '2 unidades', isFromGarden: false },
      { name: 'zanahoria', measure: '3 unidades', isFromGarden: false },
      { name: 'ajo', measure: '4 dientes', isFromGarden: false },
      { name: 'perejil', measure: 'al gusto', isFromGarden: false },
      { name: 'aceite de oliva', measure: '4 cucharadas', isFromGarden: false }
    ],
    tips: [
      'Cuanto más tiempo marine el pollo, más sabor tendrá',
      'Puedes añadir patatas al horno para completar el plato'
    ],
    season: ['primavera', 'verano', 'otoño']
  },
  {
    id: '8',
    name: 'Ternera Salteada con Espinacas y Ajo',
    description: 'Salteado rápido de ternera tierna con espinacas frescas y ajos dorados',
    category: 'principal',
    type_dieta: ['omnivora'],
    prepTime: 20,
    difficulty: 'facil',
    servings: 2,
    imageUrl: 'assets/images/ternera-salteada.jpg',
    instructions: [
      'Corta la ternera en tiras finas',
      'Dora el ajo laminado en aceite de oliva',
      'Sella la ternera a fuego fuerte 2 minutos',
      'Añade las espinacas frescas y saltea 2 minutos más',
      'Sazona con sal, pimienta y un chorrito de limón',
      'Decora con cebollino picado'
    ],
    ingredients: [
      { name: 'ternera', measure: '300g', isFromGarden: false },
      { name: 'espinacas', measure: '200g', isFromGarden: false },
      { name: 'ajo', measure: '3 dientes', isFromGarden: false },
      { name: 'cebollino', measure: 'al gusto', isFromGarden: false },
      { name: 'aceite de oliva', measure: '2 cucharadas', isFromGarden: false },
      { name: 'limón', measure: '1/2 unidad', isFromGarden: false }
    ],
    tips: [
      'El fuego alto es clave para sellar bien la carne',
      'Las espinacas reducen mucho, añade más de lo que parece'
    ],
    season: ['primavera', 'otoño', 'invierno']
  },
  {
    id: '9',
    name: 'Pimientos Rellenos de Carne y Hierbas',
    description: 'Pimientos del huerto rellenos de carne picada con tomate, orégano y cilantro',
    category: 'principal',
    type_dieta: ['omnivora'],
    prepTime: 50,
    difficulty: 'media',
    servings: 4,
    imageUrl: 'assets/images/pimiento-relleno.jpg',
    instructions: [
      'Corta la tapa de los pimientos y vacíalos',
      'Sofríe cebolla y ajo hasta dorar',
      'Añade la carne picada y cocina hasta que pierda el color',
      'Incorpora el tomate triturado, orégano y cilantro; cocina 10 min',
      'Rellena los pimientos con la mezcla',
      'Hornea a 180°C durante 30 minutos'
    ],
    ingredients: [
      { name: 'pimiento', measure: '4 unidades grandes', isFromGarden: false },
      { name: 'carne picada', measure: '400g', isFromGarden: false },
      { name: 'tomate', measure: '2 unidades', isFromGarden: false },
      { name: 'orégano', measure: '1 cucharadita', isFromGarden: false },
      { name: 'cilantro', measure: 'al gusto', isFromGarden: false },
      { name: 'cebolla', measure: '1 unidad', isFromGarden: false },
      { name: 'ajo', measure: '2 dientes', isFromGarden: false }
    ],
    tips: [
      'Puedes usar pimientos de colores para una presentación más vistosa',
      'Si sobra relleno, úsalo para pasta o arroz'
    ],
    season: ['verano', 'otoño']
  },
  {
    id: '10',
    name: 'Crema de Calabacín con Menta',
    description: 'Crema suave de calabacín del huerto con un toque fresco de menta',
    category: 'entrante',
    type_dieta: ['vegana', 'vegetariana'],
    prepTime: 25,
    difficulty: 'facil',
    servings: 4,
    imageUrl: 'assets/images/crema-calabacin.jpg',
    instructions: [
      'Trocea el calabacín y la cebolla',
      'Sofríe la cebolla con ajo en aceite de oliva 5 minutos',
      'Añade el calabacín y caldo vegetal',
      'Cocina a fuego medio 15 minutos hasta que esté tierno',
      'Tritura hasta obtener una crema fina',
      'Sirve con hojas de menta fresca y un hilo de aceite'
    ],
    ingredients: [
      { name: 'calabacín', measure: '3 unidades', isFromGarden: false },
      { name: 'menta', measure: '6 hojas', isFromGarden: false },
      { name: 'cebolla', measure: '1 unidad', isFromGarden: false },
      { name: 'ajo', measure: '2 dientes', isFromGarden: false },
      { name: 'caldo vegetal', measure: '600ml', isFromGarden: false },
      { name: 'aceite de oliva', measure: '2 cucharadas', isFromGarden: false }
    ],
    tips: [
      'Para más cremosidad añade una cucharada de yogur vegetal',
      'Deliciosa tanto caliente como fría en verano'
    ],
    season: ['verano', 'otoño']
  },
  {
    id: '11',
    name: 'Ensalada de Rúcula con Tomates Cherry y Rábanos',
    description: 'Ensalada fresca y crujiente con rúcula picante, rábanos y tomates del huerto',
    category: 'entrante',
    type_dieta: ['vegana', 'vegetariana'],
    prepTime: 10,
    difficulty: 'facil',
    servings: 2,
    imageUrl: 'assets/images/ensalada-rucula.jpg',
    instructions: [
      'Lava y seca la rúcula y los rábanos',
      'Corta los rábanos en rodajas finas',
      'Parte los tomates cherry por la mitad',
      'Mezcla todos los ingredientes en un bol',
      'Aliña con aceite, limón, sal y cebollino picado',
      'Sirve inmediatamente para que la rúcula no se ablande'
    ],
    ingredients: [
      { name: 'rúcula', measure: '80g', isFromGarden: false },
      { name: 'tomate cherry', measure: '12 unidades', isFromGarden: false },
      { name: 'rábanos', measure: '6 unidades', isFromGarden: false },
      { name: 'cebollino', measure: '1 cucharada', isFromGarden: false },
      { name: 'aceite de oliva', measure: '2 cucharadas', isFromGarden: false },
      { name: 'limón', measure: '1/2 unidad', isFromGarden: false }
    ],
    tips: [
      'Añade piñones tostados para darle más textura',
      'Un poco de queso parmesano la convierte en vegetariana con más sabor'
    ],
    season: ['primavera', 'verano']
  },
  {
    id: '12',
    name: 'Salteado de Judías Verdes con Ajo y Perejil',
    description: 'Judías verdes crujientes salteadas con ajo dorado y perejil fresco',
    category: 'principal',
    type_dieta: ['vegana', 'vegetariana'],
    prepTime: 15,
    difficulty: 'facil',
    servings: 3,
    imageUrl: 'assets/images/salterado-judias-ajo-perejil.jpg',
    instructions: [
      'Lava y despunta las judías verdes',
      'Escáldalas en agua con sal 5 minutos, luego enfría en agua fría',
      'Lamina el ajo y dóralo en aceite de oliva',
      'Añade las judías y saltea a fuego fuerte 3 minutos',
      'Sazona con sal, pimienta y espolvorea perejil picado',
      'Sirve caliente como guarnición o plato principal'
    ],
    ingredients: [
      { name: 'judías verdes', measure: '400g', isFromGarden: false },
      { name: 'ajo', measure: '4 dientes', isFromGarden: false },
      { name: 'perejil', measure: '2 cucharadas', isFromGarden: false },
      { name: 'aceite de oliva', measure: '3 cucharadas', isFromGarden: false }
    ],
    tips: [
      'El truco del agua fría mantiene el color verde brillante',
      'Puedes añadir almendras laminadas para más textura'
    ],
    season: ['verano', 'otoño']
  },
  {
    id: '13',
    name: 'Kale con Guisantes y Limón',
    description: 'Salteado nutritivo de kale y guisantes frescos con un toque cítrico',
    category: 'principal',
    type_dieta: ['vegana', 'vegetariana'],
    prepTime: 15,
    difficulty: 'facil',
    servings: 2,
    imageUrl: 'assets/images/kale-guisantes.jpg',
    instructions: [
      'Retira los tallos duros del kale y trocea las hojas',
      'Saltea el ajo en aceite de oliva',
      'Añade el kale y rehoga 4 minutos hasta que se ablande',
      'Incorpora los guisantes y cocina 3 minutos más',
      'Exprime el limón por encima y ajusta de sal',
      'Decora con cebollino picado'
    ],
    ingredients: [
      { name: 'kale', measure: '150g', isFromGarden: false },
      { name: 'guisantes', measure: '150g', isFromGarden: false },
      { name: 'ajo', measure: '2 dientes', isFromGarden: false },
      { name: 'cebollino', measure: '1 cucharada', isFromGarden: false },
      { name: 'limón', measure: '1 unidad', isFromGarden: false },
      { name: 'aceite de oliva', measure: '2 cucharadas', isFromGarden: false }
    ],
    tips: [
      'Masajea el kale con sal y limón para ablandarlo antes de cocinar',
      'Los guisantes frescos del huerto son mucho más dulces que los congelados'
    ],
    season: ['primavera', 'verano']
  },
  {
    id: '14',
    name: 'Acelgas Rehogadas con Zanahoria',
    description: 'Acelgas tiernas rehogadas con zanahoria y un sofrito de ajo y orégano',
    category: 'principal',
    type_dieta: ['vegana', 'vegetariana'],
    prepTime: 20,
    difficulty: 'facil',
    servings: 3,
    imageUrl: 'assets/images/acelga-zanahoria.jpg',
    instructions: [
      'Lava las acelgas y separa hojas de tallos',
      'Corta los tallos en trozos y las zanahorias en rodajas',
      'Sofríe ajo y orégano en aceite de oliva',
      'Añade los tallos y zanahoria; cocina 5 minutos',
      'Incorpora las hojas de acelga y rehoga 3 minutos',
      'Sazona con sal y un chorrito de limón'
    ],
    ingredients: [
      { name: 'acelgas', measure: '400g', isFromGarden: false },
      { name: 'zanahoria', measure: '2 unidades', isFromGarden: false },
      { name: 'ajo', measure: '3 dientes', isFromGarden: false },
      { name: 'orégano', measure: '1 cucharadita', isFromGarden: false },
      { name: 'aceite de oliva', measure: '3 cucharadas', isFromGarden: false },
      { name: 'limón', measure: '1/2 unidad', isFromGarden: false }
    ],
    tips: [
      'Los tallos necesitan más tiempo que las hojas, añádelos antes',
      'Un huevo escalfado encima lo convierte en un plato completo'
    ],
    season: ['otoño', 'invierno', 'primavera']
  }
];