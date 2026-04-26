// src/app/shared/components/receta-card/receta-card.component.ts
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
    const difficulties = {
      'facil': 'Fácil',
      'media': 'Medio',
      'dificil': 'Difícil'
    };
    return difficulties[this.recipe.difficulty] || 'Media';
  }

  getEstimatedTime(): string {
    return `${this.recipe.prepTime} min`;
  }

  getServings(): number {
    return this.recipe.servings;
  }

  // Nuevo método para verificar si es vegetariana/vegana según el usuario
  getDietaBadge(currentUserDiet: string): string | null {
    if (this.recipe.type_dieta.includes('vegana')) {
      return '🌱 Vegana';
    }
    if (this.recipe.type_dieta.includes('vegetariana')) {
      return '🥬 Vegetariana';
    }
    return null;
  }

  onCardClick(): void {
    this.recipeClick.emit(this.recipe);
  }

   getCategoryText(): string {
    const categories = {
      'entrante': '🥗 Entrante',
      'principal': '🍽️ Principal',
      'postre': '🍰 Postre',
      'bebida': '🥤 Bebida',
      'salsa': '🥫 Salsa'
    };
    return categories[this.recipe.category] || this.recipe.category;
  }

  getSeasonText(): string {
    if (!this.recipe.season) return '';
    const seasons = {
      'primavera': '🌼 Primavera',
      'verano': '☀️ Verano',
      'otoño': '🍂 Otoño',
      'invierno': '❄️ Invierno'
    };
    return this.recipe.season.map(s => seasons[s]).join(', ');
  }
}