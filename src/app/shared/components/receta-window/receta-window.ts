// src/app/shared/components/receta-window/receta-window.component.ts
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Recipe, GardenPlant } from '../../../models/interfaces';
import { RecipesService } from '../../../services/recipes';

@Component({
  selector: 'app-receta-window',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './receta-window.html',
  styleUrls: ['./receta-window.scss']
})
export class RecetaWindowComponent implements OnInit {
  @Input() recipe: Recipe | null = null;
  @Input() gardenPlants: GardenPlant[] = [];
  @Output() close = new EventEmitter<void>();
  
  compatibilityPercentage: number = 0;
  ingredientsBySource: { fromGarden: any[], missing: any[] } = { fromGarden: [], missing: [] };

  constructor(private recipesService: RecipesService) {}

  ngOnInit(): void {
    if (this.recipe && this.gardenPlants.length > 0) {
      const updatedRecipe = this.recipesService.updateGardenCompatibility(this.recipe, this.gardenPlants);
      this.recipe = updatedRecipe;
      this.compatibilityPercentage = this.recipesService.calculateCompatibility(updatedRecipe);
      this.separateIngredients();
    } else if (this.recipe) {
      this.compatibilityPercentage = 0;
      this.separateIngredients();
    }
  }

  separateIngredients(): void {
    if (!this.recipe) return;
    
    this.ingredientsBySource = {
      fromGarden: this.recipe.ingredients.filter(i => i.isFromGarden),
      missing: this.recipe.ingredients.filter(i => !i.isFromGarden)
    };
  }

  getCategoryText(): string {
    const categories = {
      'entrante': '🥗 Entrante',
      'principal': '🍽️ Principal',
      'postre': '🍰 Postre',
      'bebida': '🥤 Bebida',
      'salsa': '🥫 Salsa'
    };
    return categories[this.recipe?.category || 'principal'] || '🍽️ Principal';
  }

  getDietaText(): string {
    if (!this.recipe) return '';
    if (this.recipe.type_dieta.includes('vegana')) {
      return '🌱 Vegana';
    }
    if (this.recipe.type_dieta.includes('vegetariana')) {
      return '🥬 Vegetariana';
    }
    return '🍖 Omnívora';
  }

  onClose(): void {
    this.close.emit();
  }

  handleOutsideClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('receta-window')) {
      this.onClose();
    }
  }
}