import { Component } from '@angular/core';
import { RecetaCardComponent } from '../../shared/components/receta-card/receta-card';

export interface Meal {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
}

@Component({
  selector: 'app-recetas',
  standalone: true,
  templateUrl: './recetas.html',
  styleUrls: ['./recetas.scss'],
  imports: [RecetaCardComponent]
})
export class RecetasComponent {

  meals: Meal[] = []; // 👈 AQUÍ VA

}