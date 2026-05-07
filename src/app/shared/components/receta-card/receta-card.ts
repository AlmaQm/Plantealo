import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Recipe } from '../../../models/interfaces';

@Component({
  selector: 'app-receta-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './receta-card.html',
  styleUrls: ['./receta-card.scss']
})
export class RecetaCardComponent {
  @Input() recipe!: Recipe;
  @Input() compatibilityPercentage: number = 0;
  @Output() recipeClick = new EventEmitter<Recipe>();

  getDificultad(): string {
    const map: Record<Recipe['dificultad'], string> = {
      'FACIL': 'Fácil', 'MEDIA': 'Medio', 'DIFICL': 'Difícil'
    };
    return map[this.recipe.dificultad];
  }

  getTiempo(): string {
    return `${this.recipe.tiempo_preparacion} min`;
  }

  getCategoriaText(): string {
    const map: Record<Recipe['categoria'], string> = {
      'ENTRANTE': '🥗 Entrante', 'PRINCIPAL': '🍽️ Principal',
      'POSTRE': '🍰 Postre',    'BEBIDA': '🥤 Bebida'
    };
    return map[this.recipe.categoria] ?? this.recipe.categoria;
  }

  onCardClick(): void {
    this.recipeClick.emit(this.recipe);
  }
}
