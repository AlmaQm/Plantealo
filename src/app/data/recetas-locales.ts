// import { Recipe } from '../models/interfaces';

// export const RECETAS_LOCALES: Recipe[] = [
//   {
//     id_receta: 1,
//     nombre_receta: 'Bowl Vegetariano',
//     descripcion: 'Un bowl fresco y nutritivo con ingredientes directos de tu huerto',
//     categoria: 'PRINCIPAL',
//     tipo_dieta: 'VEGANA',
//     tiempo_preparacion: 20,
//     dificultad: 'FACIL',
//     num_comensales: 2,
//     imagen_url: 'assets/images/bowl-vegetariano.jpg',
//     instrucciones: [
//       'Lava y corta las lechugas en trozos pequeños',
//       'Pica finamente las hierbas frescas (perejil, cilantro, albahaca)',
//       'Cocina la quinoa según instrucciones del paquete',
//       'En un bowl, coloca la base de lechugas',
//       'Añade la quinoa y los tomates cherry cortados por la mitad',
//       'Decora con las hierbas y aliña al gusto'
//     ],
//     ingredientes: [
//       { nombre_ingrediente: 'lechuga',        cantidad: '2 tazas' },
//       { nombre_ingrediente: 'tomate cherry',  cantidad: '10 unidades' },
//       { nombre_ingrediente: 'pepino',         cantidad: '1/2 unidad' },
//       { nombre_ingrediente: 'albahaca',       cantidad: 'al gusto' },
//       { nombre_ingrediente: 'perejil',        cantidad: 'al gusto' },
//       { nombre_ingrediente: 'quinoa',         cantidad: '1 taza' },
//       { nombre_ingrediente: 'aceite de oliva', cantidad: '2 cucharadas' },
//       { nombre_ingrediente: 'limón',          cantidad: '1 unidad' }
//     ],
//     tips: 'Añade aguacate para hacerlo más cremoso',
//     estacion: 'PRIMAVERA'
//   },
//   {
//     id_receta: 2,
//     nombre_receta: 'Ensalada Caprese',
//     descripcion: 'La clásica ensalada italiana, perfecta cuando tus tomates están en su punto',
//     categoria: 'ENTRANTE',
//     tipo_dieta: 'VEGETARIANA',
//     tiempo_preparacion: 15,
//     dificultad: 'FACIL',
//     num_comensales: 2,
//     imagen_url: 'assets/images/ensalada-carpese.jpg',
//     instrucciones: [
//       'Lava y corta los tomates en rodajas de 1cm',
//       'Corta la mozzarella en rodajas del mismo grosor',
//       'Alterna rodajas de tomate y mozzarella en un plato',
//       'Espolvorea hojas de albahaca fresca',
//       'Aliña con aceite de oliva, sal y pimienta al gusto'
//     ],
//     ingredientes: [
//       { nombre_ingrediente: 'tomate',           cantidad: '3 unidades' },
//       { nombre_ingrediente: 'albahaca',          cantidad: '1 puñado' },
//       { nombre_ingrediente: 'mozzarella',        cantidad: '200g' },
//       { nombre_ingrediente: 'aceite de oliva',   cantidad: '3 cucharadas' },
//       { nombre_ingrediente: 'vinagre balsámico', cantidad: '1 cucharada' }
//     ],
//     tips: 'Usa tomates recién cogidos del huerto, marcan la diferencia',
//     estacion: 'VERANO'
//   },
//   {
//     id_receta: 3,
//     nombre_receta: 'Salsa Verde',
//     descripcion: 'Salsa versátil para acompañar pastas, carnes o vegetales',
//     categoria: 'ENTRANTE',
//     tipo_dieta: 'VEGANA',
//     tiempo_preparacion: 8,
//     dificultad: 'FACIL',
//     num_comensales: 6,
//     imagen_url: 'assets/images/salsa-verde.jpg',
//     instrucciones: [
//       'Lava bien todas las hierbas',
//       'Pela los dientes de ajo',
//       'En una licuadora, coloca todas las hierbas, los ajos y el aceite',
//       'Añade el jugo de limón y sal al gusto',
//       'Licúa hasta obtener una salsa homogénea'
//     ],
//     ingredientes: [
//       { nombre_ingrediente: 'perejil',       cantidad: '1 taza' },
//       { nombre_ingrediente: 'cilantro',      cantidad: '1/2 taza' },
//       { nombre_ingrediente: 'albahaca',      cantidad: '1/2 taza' },
//       { nombre_ingrediente: 'menta',         cantidad: '1/4 taza' },
//       { nombre_ingrediente: 'ajo',           cantidad: '2 dientes' },
//       { nombre_ingrediente: 'aceite de oliva', cantidad: '1/2 taza' },
//       { nombre_ingrediente: 'limón',         cantidad: '1 unidad' }
//     ],
//     tips: 'Conserva en frasco de vidrio en la nevera hasta 1 semana',
//     estacion: 'PRIMAVERA'
//   },
//   {
//     id_receta: 4,
//     nombre_receta: 'Gazpacho Andaluz',
//     descripcion: 'Sopa fría perfecta para los calurosos días de verano',
//     categoria: 'ENTRANTE',
//     tipo_dieta: 'VEGANA',
//     tiempo_preparacion: 15,
//     dificultad: 'FACIL',
//     num_comensales: 4,
//     imagen_url: 'assets/images/gazpachoç.jpg',
//     instrucciones: [
//       'Lava bien todas las verduras',
//       'Corta en trozos grandes: tomates, pepino, pimiento y cebolla',
//       'Coloca todo en la batidora junto con el aceite, vinagre y sal',
//       'Bate hasta obtener una textura fina',
//       'Enfría en la nevera al menos 2 horas antes de servir'
//     ],
//     ingredientes: [
//       { nombre_ingrediente: 'tomate',          cantidad: '1kg' },
//       { nombre_ingrediente: 'pepino',          cantidad: '1 unidad' },
//       { nombre_ingrediente: 'pimiento verde',  cantidad: '1 unidad' },
//       { nombre_ingrediente: 'cebolla',         cantidad: '1/2 unidad' },
//       { nombre_ingrediente: 'ajo',             cantidad: '2 dientes' },
//       { nombre_ingrediente: 'aceite de oliva', cantidad: '100ml' },
//       { nombre_ingrediente: 'vinagre de vino', cantidad: '2 cucharadas' }
//     ],
//     tips: 'Cuanto más maduros los tomates, mejor sabor',
//     estacion: 'VERANO'
//   },
//   {
//     id_receta: 5,
//     nombre_receta: 'Agua de Menta y Pepino',
//     descripcion: 'Bebida hidratante y refrescante con ingredientes del huerto',
//     categoria: 'BEBIDA',
//     tipo_dieta: 'VEGANA',
//     tiempo_preparacion: 5,
//     dificultad: 'FACIL',
//     num_comensales: 4,
//     imagen_url: 'assets/images/agua-pepino.jpg',
//     instrucciones: [
//       'Lava bien el pepino y la menta',
//       'Corta el pepino en rodajas finas',
//       'En una jarra, añade el pepino y las hojas de menta',
//       'Añade el jugo de limón y el agua',
//       'Deja reposar en nevera 30 minutos'
//     ],
//     ingredientes: [
//       { nombre_ingrediente: 'pepino', cantidad: '1 unidad' },
//       { nombre_ingrediente: 'menta',  cantidad: '10 hojas' },
//       { nombre_ingrediente: 'limón',  cantidad: '2 unidades' },
//       { nombre_ingrediente: 'agua',   cantidad: '2 litros' }
//     ],
//     tips: 'Ideal para servir en una jarra de vidrio con hielo',
//     estacion: 'VERANO'
//   },
//   {
//     id_receta: 6,
//     nombre_receta: 'Pesto de Albahaca',
//     descripcion: 'Salsa italiana clásica, perfecta para pastas',
//     categoria: 'ENTRANTE',
//     tipo_dieta: 'VEGETARIANA',
//     tiempo_preparacion: 10,
//     dificultad: 'FACIL',
//     num_comensales: 4,
//     imagen_url: 'assets/images/pesto.jpg',
//     instrucciones: [
//       'Lava y seca bien las hojas de albahaca',
//       'En un mortero, machaca los piñones y el ajo',
//       'Añade la albahaca y sigue machacando',
//       'Incorpora el queso parmesano rallado',
//       'Añade el aceite de oliva poco a poco'
//     ],
//     ingredientes: [
//       { nombre_ingrediente: 'albahaca',         cantidad: '2 tazas' },
//       { nombre_ingrediente: 'piñones',          cantidad: '50g' },
//       { nombre_ingrediente: 'queso parmesano',  cantidad: '50g' },
//       { nombre_ingrediente: 'ajo',              cantidad: '2 dientes' },
//       { nombre_ingrediente: 'aceite de oliva',  cantidad: '1/2 taza' }
//     ],
//     tips: 'El mortero tradicional da mejor textura que la batidora',
//     estacion: 'PRIMAVERA'
//   },
//   {
//     id_receta: 7,
//     nombre_receta: 'Pollo al Romero',
//     descripcion: 'Pollo marinado con romero fresco y verduras del huerto',
//     categoria: 'PRINCIPAL',
//     tipo_dieta: 'OMNIVORA',
//     tiempo_preparacion: 45,
//     dificultad: 'MEDIA',
//     num_comensales: 4,
//     imagen_url: 'assets/images/pollo-romero.jpg',
//     instrucciones: [
//       'Mezcla aceite, romero picado, tomillo, ajo y sal para la marinada',
//       'Marina el pollo al menos 30 minutos',
//       'Corta pimientos y zanahoria en trozos medianos',
//       'Dora el pollo en sartén a fuego alto 3 min por lado',
//       'Añade las verduras y hornea a 200°C durante 25 minutos',
//       'Espolvorea perejil fresco antes de servir'
//     ],
//     ingredientes: [
//       { nombre_ingrediente: 'pollo',           cantidad: '4 muslos' },
//       { nombre_ingrediente: 'romero',          cantidad: '3 ramas' },
//       { nombre_ingrediente: 'tomillo',         cantidad: '2 ramas' },
//       { nombre_ingrediente: 'pimiento',        cantidad: '2 unidades' },
//       { nombre_ingrediente: 'zanahoria',       cantidad: '3 unidades' },
//       { nombre_ingrediente: 'ajo',             cantidad: '4 dientes' },
//       { nombre_ingrediente: 'perejil',         cantidad: 'al gusto' },
//       { nombre_ingrediente: 'aceite de oliva', cantidad: '4 cucharadas' }
//     ],
//     tips: 'Cuanto más tiempo marine el pollo, más sabor tendrá',
//     estacion: 'PRIMAVERA'
//   },
//   {
//     id_receta: 8,
//     nombre_receta: 'Ternera con Espinacas',
//     descripcion: 'Salteado rápido de ternera tierna con espinacas frescas y ajos dorados',
//     categoria: 'PRINCIPAL',
//     tipo_dieta: 'OMNIVORA',
//     tiempo_preparacion: 20,
//     dificultad: 'FACIL',
//     num_comensales: 2,
//     imagen_url: 'assets/images/ternera-salteada.jpg',
//     instrucciones: [
//       'Corta la ternera en tiras finas',
//       'Dora el ajo laminado en aceite de oliva',
//       'Sella la ternera a fuego fuerte 2 minutos',
//       'Añade las espinacas frescas y saltea 2 minutos más',
//       'Sazona con sal, pimienta y un chorrito de limón'
//     ],
//     ingredientes: [
//       { nombre_ingrediente: 'ternera',         cantidad: '300g' },
//       { nombre_ingrediente: 'espinacas',       cantidad: '200g' },
//       { nombre_ingrediente: 'ajo',             cantidad: '3 dientes' },
//       { nombre_ingrediente: 'cebollino',       cantidad: 'al gusto' },
//       { nombre_ingrediente: 'aceite de oliva', cantidad: '2 cucharadas' },
//       { nombre_ingrediente: 'limón',           cantidad: '1/2 unidad' }
//     ],
//     tips: 'El fuego alto es clave para sellar bien la carne',
//     estacion: 'OTOÑO'
//   },
//   {
//     id_receta: 9,
//     nombre_receta: 'Pimientos Rellenos',
//     descripcion: 'Pimientos del huerto rellenos de carne picada con tomate y hierbas',
//     categoria: 'PRINCIPAL',
//     tipo_dieta: 'OMNIVORA',
//     tiempo_preparacion: 50,
//     dificultad: 'MEDIA',
//     num_comensales: 4,
//     imagen_url: 'assets/images/pimiento-relleno.jpg',
//     instrucciones: [
//       'Corta la tapa de los pimientos y vacíalos',
//       'Sofríe cebolla y ajo hasta dorar',
//       'Añade la carne picada y cocina hasta que pierda el color',
//       'Incorpora el tomate triturado, orégano y cilantro; cocina 10 min',
//       'Rellena los pimientos y hornea a 180°C durante 30 minutos'
//     ],
//     ingredientes: [
//       { nombre_ingrediente: 'pimiento',      cantidad: '4 unidades' },
//       { nombre_ingrediente: 'carne picada',  cantidad: '400g' },
//       { nombre_ingrediente: 'tomate',        cantidad: '2 unidades' },
//       { nombre_ingrediente: 'orégano',       cantidad: '1 cucharadita' },
//       { nombre_ingrediente: 'cilantro',      cantidad: 'al gusto' },
//       { nombre_ingrediente: 'cebolla',       cantidad: '1 unidad' },
//       { nombre_ingrediente: 'ajo',           cantidad: '2 dientes' }
//     ],
//     tips: 'Si sobra relleno, úsalo para pasta o arroz',
//     estacion: 'VERANO'
//   },
//   {
//     id_receta: 10,
//     nombre_receta: 'Crema de Calabacín',
//     descripcion: 'Crema suave de calabacín con un toque fresco de menta',
//     categoria: 'ENTRANTE',
//     tipo_dieta: 'VEGANA',
//     tiempo_preparacion: 25,
//     dificultad: 'FACIL',
//     num_comensales: 4,
//     imagen_url: 'assets/images/crema-calabacin.jpg',
//     instrucciones: [
//       'Trocea el calabacín y la cebolla',
//       'Sofríe la cebolla con ajo en aceite de oliva 5 minutos',
//       'Añade el calabacín y caldo vegetal',
//       'Cocina a fuego medio 15 minutos hasta que esté tierno',
//       'Tritura hasta obtener una crema fina',
//       'Sirve con hojas de menta fresca'
//     ],
//     ingredientes: [
//       { nombre_ingrediente: 'calabacín',       cantidad: '3 unidades' },
//       { nombre_ingrediente: 'menta',           cantidad: '6 hojas' },
//       { nombre_ingrediente: 'cebolla',         cantidad: '1 unidad' },
//       { nombre_ingrediente: 'ajo',             cantidad: '2 dientes' },
//       { nombre_ingrediente: 'caldo vegetal',   cantidad: '600ml' },
//       { nombre_ingrediente: 'aceite de oliva', cantidad: '2 cucharadas' }
//     ],
//     tips: 'Deliciosa tanto caliente como fría en verano',
//     estacion: 'VERANO'
//   },
//   {
//     id_receta: 11,
//     nombre_receta: 'Ensalada de Rúcula',
//     descripcion: 'Ensalada fresca con rúcula, rábanos y tomates del huerto',
//     categoria: 'ENTRANTE',
//     tipo_dieta: 'VEGANA',
//     tiempo_preparacion: 10,
//     dificultad: 'FACIL',
//     num_comensales: 2,
//     imagen_url: 'assets/images/ensalada-rucula.jpg',
//     instrucciones: [
//       'Lava y seca la rúcula y los rábanos',
//       'Corta los rábanos en rodajas finas',
//       'Parte los tomates cherry por la mitad',
//       'Mezcla todos los ingredientes en un bol',
//       'Aliña con aceite, limón y cebollino picado'
//     ],
//     ingredientes: [
//       { nombre_ingrediente: 'rúcula',          cantidad: '80g' },
//       { nombre_ingrediente: 'tomate cherry',   cantidad: '12 unidades' },
//       { nombre_ingrediente: 'rábanos',         cantidad: '6 unidades' },
//       { nombre_ingrediente: 'cebollino',       cantidad: '1 cucharada' },
//       { nombre_ingrediente: 'aceite de oliva', cantidad: '2 cucharadas' },
//       { nombre_ingrediente: 'limón',           cantidad: '1/2 unidad' }
//     ],
//     tips: 'Sirve inmediatamente para que la rúcula no se ablande',
//     estacion: 'PRIMAVERA'
//   },
//   {
//     id_receta: 12,
//     nombre_receta: 'Judías Verdes al Ajo',
//     descripcion: 'Judías verdes crujientes salteadas con ajo dorado y perejil fresco',
//     categoria: 'PRINCIPAL',
//     tipo_dieta: 'VEGANA',
//     tiempo_preparacion: 15,
//     dificultad: 'FACIL',
//     num_comensales: 3,
//     imagen_url: 'assets/images/salterado-judias-ajo-perejil.jpg',
//     instrucciones: [
//       'Lava y despunta las judías verdes',
//       'Escáldalas en agua con sal 5 minutos, enfría en agua fría',
//       'Lamina el ajo y dóralo en aceite de oliva',
//       'Añade las judías y saltea a fuego fuerte 3 minutos',
//       'Espolvorea perejil picado y sirve'
//     ],
//     ingredientes: [
//       { nombre_ingrediente: 'judías verdes',   cantidad: '400g' },
//       { nombre_ingrediente: 'ajo',             cantidad: '4 dientes' },
//       { nombre_ingrediente: 'perejil',         cantidad: '2 cucharadas' },
//       { nombre_ingrediente: 'aceite de oliva', cantidad: '3 cucharadas' }
//     ],
//     tips: 'El agua fría mantiene el color verde brillante',
//     estacion: 'VERANO'
//   },
//   {
//     id_receta: 13,
//     nombre_receta: 'Kale con Guisantes',
//     descripcion: 'Salteado nutritivo de kale y guisantes frescos con toque cítrico',
//     categoria: 'PRINCIPAL',
//     tipo_dieta: 'VEGANA',
//     tiempo_preparacion: 15,
//     dificultad: 'FACIL',
//     num_comensales: 2,
//     imagen_url: 'assets/images/kale-guisantes.jpg',
//     instrucciones: [
//       'Retira los tallos duros del kale y trocea las hojas',
//       'Saltea el ajo en aceite de oliva',
//       'Añade el kale y rehoga 4 minutos',
//       'Incorpora los guisantes y cocina 3 minutos más',
//       'Exprime el limón por encima'
//     ],
//     ingredientes: [
//       { nombre_ingrediente: 'kale',            cantidad: '150g' },
//       { nombre_ingrediente: 'guisantes',       cantidad: '150g' },
//       { nombre_ingrediente: 'ajo',             cantidad: '2 dientes' },
//       { nombre_ingrediente: 'cebollino',       cantidad: '1 cucharada' },
//       { nombre_ingrediente: 'limón',           cantidad: '1 unidad' },
//       { nombre_ingrediente: 'aceite de oliva', cantidad: '2 cucharadas' }
//     ],
//     tips: 'Los guisantes frescos del huerto son mucho más dulces',
//     estacion: 'PRIMAVERA'
//   },
//   {
//     id_receta: 14,
//     nombre_receta: 'Acelgas con Zanahoria',
//     descripcion: 'Acelgas rehogadas con zanahoria y un sofrito de ajo y orégano',
//     categoria: 'PRINCIPAL',
//     tipo_dieta: 'VEGANA',
//     tiempo_preparacion: 20,
//     dificultad: 'FACIL',
//     num_comensales: 3,
//     imagen_url: 'assets/images/acelga-zanahoria.jpg',
//     instrucciones: [
//       'Lava las acelgas y separa hojas de tallos',
//       'Corta los tallos en trozos y las zanahorias en rodajas',
//       'Sofríe ajo y orégano en aceite de oliva',
//       'Añade los tallos y zanahoria; cocina 5 minutos',
//       'Incorpora las hojas de acelga y rehoga 3 minutos'
//     ],
//     ingredientes: [
//       { nombre_ingrediente: 'acelgas',         cantidad: '400g' },
//       { nombre_ingrediente: 'zanahoria',       cantidad: '2 unidades' },
//       { nombre_ingrediente: 'ajo',             cantidad: '3 dientes' },
//       { nombre_ingrediente: 'orégano',         cantidad: '1 cucharadita' },
//       { nombre_ingrediente: 'aceite de oliva', cantidad: '3 cucharadas' },
//       { nombre_ingrediente: 'limón',           cantidad: '1/2 unidad' }
//     ],
//     tips: 'Los tallos necesitan más tiempo que las hojas, añádelos antes',
//     estacion: 'OTOÑO'
//   }
// ];
