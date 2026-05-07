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

  compatibilityPercentage = 0;
  ingredientsBySource: { fromGarden: any[]; missing: any[] } = { fromGarden: [], missing: [] };

  constructor(private recipesService: RecipesService) {}

  ngOnInit(): void {
    if (this.recipe) {
      const updated = this.recipesService.updateGardenCompatibility(this.recipe, this.gardenPlants);
      this.recipe = updated;
      this.compatibilityPercentage = this.recipesService.calculateCompatibility(updated);
      this.ingredientsBySource = {
        fromGarden: updated.ingredientes.filter(i => i.isFromGarden),
        missing:    updated.ingredientes.filter(i => !i.isFromGarden)
      };
    }
  }

  getCategoriaText(): string {
    const map: Record<string, string> = {
      'ENTRANTE': '🥗 Entrante', 'PRINCIPAL': '🍽️ Principal',
      'POSTRE': '🍰 Postre',    'BEBIDA': '🥤 Bebida'
    };
    return map[this.recipe?.categoria ?? ''] ?? '';
  }

  getDietaText(): string {
    const map: Record<string, string> = {
      'VEGANA': '🌱 Vegana', 'VEGETARIANA': '🥬 Vegetariana', 'OMNIVORA': '🍖 Omnívora'
    };
    return map[this.recipe?.tipo_dieta ?? ''] ?? '';
  }

  onClose(): void { this.close.emit(); }

  handleOutsideClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('receta-window')) {
      this.onClose();
    }
  }
}
