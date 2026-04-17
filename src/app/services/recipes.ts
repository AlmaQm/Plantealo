import { Injectable } from '@angular/core';
import { Receta } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class RecipesService {

  private recetas: Receta[] = [
    {
      id: 1,
      titulo: 'Bowl Vegetariano con Lechugas y Hierbas',
      autorUser: 'user123',
      autorNombre: 'Carme',
      tiempoPrep: 20,
      imagen: 'https://via.placeholder.com/300',
      instrucciones: [
        'Lava las verduras.',
        'Mezcla todos los ingredientes.',
        'Añade limón al gusto.'
      ],
      ingredientes: [
        { nombre: 'Lechuga', cantidad: '1 unidad', esDeHuerto: true },
        { nombre: 'Albahaca', cantidad: '5 hojas', esDeHuerto: true },
        { nombre: 'Cilantro', cantidad: '3 ramas', esDeHuerto: true },
        { nombre: 'Quinoa', cantidad: '100 g', esDeHuerto: false },
        { nombre: 'Aguacate', cantidad: '1 unidad', esDeHuerto: false },
        { nombre: 'Limón', cantidad: '1 unidad', esDeHuerto: false }
      ]
    }
  ];

  getRecetas(): Receta[] {
    return this.recetas;
  }
}