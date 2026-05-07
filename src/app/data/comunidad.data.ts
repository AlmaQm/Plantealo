import { Publicacion } from '../models/interfaces';

export const COMUNIDAD_DATA: Publicacion[] = [
  {
    publicacion_id: 1,
    usuario_id: 2,
    nombre_usuario: 'Laura García',
    username: '@laura_garden',
    avatar_inicial: 'L',
    imagen_url: 'assets/images/tomate-cherry.jpg',
    categoria: 'HUERTO',
    descripcion: '¡Mis tomates cherry están listos para cosechar! Este año han salido increíbles, les he puesto compost casero y la diferencia se nota muchísimo.',
    likes: 23,
    liked: false,
    siguiendo: false,
    fecha: new Date('2026-05-06'),
    comentarios: [
      {
        comentario_id: 1,
        usuario_id: 3,
        nombre_usuario: 'Marc Puig',
        username: '@marc_vegetal',
        texto: '¡Qué bonitos! ¿Qué variedad usas?',
        fecha: new Date('2026-05-06')
      },
      {
        comentario_id: 2,
        usuario_id: 4,
        nombre_usuario: 'Ana Torres',
        username: '@ana_cocina',
        texto: 'Yo también uso compost y es una pasada la diferencia 🍅',
        fecha: new Date('2026-05-06')
      }
    ]
  },
  {
    publicacion_id: 2,
    usuario_id: 3,
    nombre_usuario: 'Marc Puig',
    username: '@marc_vegetal',
    avatar_inicial: 'M',
    imagen_url: 'assets/images/pesto.jpg',
    categoria: 'RECETA',
    descripcion: 'Pesto de albahaca con las hierbas de mi huerto. Sencillo, rápido y delicioso. Solo necesitas albahaca fresca, piñones, parmesano y buen aceite de oliva.',
    likes: 31,
    liked: false,
    siguiendo: false,
    fecha: new Date('2026-05-05'),
    comentarios: [
      {
        comentario_id: 3,
        usuario_id: 2,
        nombre_usuario: 'Laura García',
        username: '@laura_garden',
        texto: 'Tengo albahaca de sobra, ¡lo hago este finde!',
        fecha: new Date('2026-05-05')
      }
    ]
  },
  {
    publicacion_id: 3,
    usuario_id: 4,
    nombre_usuario: 'Ana Torres',
    username: '@ana_cocina',
    avatar_inicial: 'A',
    imagen_url: 'assets/images/lechuga.jpg',
    categoria: 'COSECHA',
    descripcion: 'Primera cosecha de lechugas del año 🥬 Han crecido en solo 6 semanas desde la siembra. El secreto: riego constante y sombra parcial en las horas de más calor.',
    likes: 47,
    liked: false,
    siguiendo: false,
    fecha: new Date('2026-05-04'),
    comentarios: []
  },
  {
    publicacion_id: 4,
    usuario_id: 5,
    nombre_usuario: 'Jordi Mas',
    username: '@jordi_huerto',
    avatar_inicial: 'J',
    imagen_url: 'assets/images/albahaca.jpg',
    categoria: 'CONSEJO',
    descripcion: 'Consejo del día: la albahaca no le gusta el frío. Si la tienes en exterior y bajan de 10°C por la noche, métela dentro. Un golpe de frío puede arruinar toda la planta en pocas horas.',
    likes: 15,
    liked: false,
    siguiendo: false,
    fecha: new Date('2026-05-03'),
    comentarios: [
      {
        comentario_id: 4,
        usuario_id: 2,
        nombre_usuario: 'Laura García',
        username: '@laura_garden',
        texto: 'Gracias, no lo sabía! La mía está fuera 😅',
        fecha: new Date('2026-05-03')
      },
      {
        comentario_id: 5,
        usuario_id: 4,
        nombre_usuario: 'Ana Torres',
        username: '@ana_cocina',
        texto: 'Muy buen consejo, yo aprendí a las malas 🥲',
        fecha: new Date('2026-05-03')
      }
    ]
  },
  {
    publicacion_id: 5,
    usuario_id: 6,
    nombre_usuario: 'Sara Vidal',
    username: '@sara_verde',
    avatar_inicial: 'S',
    imagen_url: 'assets/images/espinacas.jpg',
    categoria: 'HUERTO',
    descripcion: 'Huerto urbano en un balcón de 6m²! Con un poco de organización caben muchas más plantas de lo que parece. Esta temporada: espinacas, rúcula, cebollino, menta y perejil.',
    likes: 58,
    liked: false,
    siguiendo: false,
    fecha: new Date('2026-05-02'),
    comentarios: []
  }
];
