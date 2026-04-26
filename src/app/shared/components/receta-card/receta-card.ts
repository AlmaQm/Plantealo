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

  getDifficulty(): string {
    // Lógica simple para determinar dificultad basada en ingredientes
    if (this.recipe.ingredients.length <= 5) return 'Fácil';
    if (this.recipe.ingredients.length <= 8) return 'Medio';
    return 'Avanzado';
  }

  getEstimatedTime(): string {
    // Estimación basada en cantidad de ingredientes y complejidad
    const baseTime = Math.max(15, Math.min(60, this.recipe.ingredients.length * 3));
    return `${baseTime} min`;
  }

  getServings(): number {
    // Estimación por defecto, la API no siempre da porciones
    return Math.max(2, Math.min(6, Math.floor(this.recipe.ingredients.length / 3)));
  }

  onCardClick(): void {
    this.recipeClick.emit(this.recipe);
  }
}