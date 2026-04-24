import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Receta } from '../models/interfaces';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RecipesService {
  private apiUrl = 'https://www.themealdb.com/api/json/v1/1/filter.php?c=';
  private detailUrl = 'https://www.themealdb.com/api/json/v1/1/lookup.php?i=';

  constructor(private http: HttpClient) {}

getRecetasPorDieta(tipoDieta: string): Observable<any[]> {
  const categoria = (tipoDieta === 'omnivora') ? 'Chicken' : 'Vegetarian';
  return this.http.get<any>(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`).pipe(
    map(res => {
      // "res.meals" es el array que viste en el console.log
      return res.meals.map((m: any) => ({
        id: m.idMeal,
        titulo: m.strMeal,        // 👈 Aquí ocurre la magia
        imagen: m.strMealThumb,   // 👈 Ahora tu HTML lo entenderá
        compatibilidad: Math.floor(Math.random() * 60) + 20 // De momento aleatorio
      }));
    })
  );
}

  // 2. Obtenemos el detalle y lo convertimos a tu interfaz "Receta"
  getDetalleReceta(id: string): Observable<Receta> {
    return this.http.get<any>(`${this.detailUrl}${id}`).pipe(
      map(res => {
        const meal = res.meals[0];
        const ingredientes: any[] = [];

        for (let i = 1; i <= 20; i++) {
          const nombre = meal[`strIngredient${i}`];
          const cantidad = meal[`strMeasure${i}`];
          if (nombre && nombre.trim() !== "") {
            ingredientes.push({ nombre, cantidad, esDeHuerto: false });
          }
        }

        return {
          id: meal.idMeal,
          titulo: meal.strMeal,
          autorUser: 'TheMealDB',
          autorNombre: 'Chef API',
          ingredientes: ingredientes,
          instrucciones: meal.strInstructions.split('\r\n').filter((p: string) => p.length > 0),
          tiempoPrep: 25, // Valor por defecto
          imagen: meal.strMealThumb
        };
      })
    );
  }
}