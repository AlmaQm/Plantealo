import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecipesService } from '../../services/recipes';
import { RecetaCardComponent } from '../../shared/components/receta-card/receta-card';
import { RecetaWindowComponent } from '../../shared/components/receta-window/receta-window';
import { Recipe, GardenPlant } from '../../models/interfaces';
import { RECETAS_LOCALES } from '../../data/recetas-locales';

type TipoDieta = 'VEGETARIANA' | 'VEGANA' | 'OMNIVORA';

@Component({
  selector: 'app-recetas',
  standalone: true,
  imports: [CommonModule, FormsModule, RecetaCardComponent, RecetaWindowComponent],
  templateUrl: './recetas.html',
  styleUrls: ['./recetas.scss']
})
export class RecetasComponent implements OnInit {
  recipes: Recipe[] = [];
  filteredRecipes: Recipe[] = [];
  selectedRecipe: Recipe | null = null;
  searchTerm = '';

  readonly dietaUsuario: TipoDieta = 'VEGETARIANA';

  readonly dietaChips: { value: TipoDieta; label: string }[] = [
    { value: 'VEGETARIANA', label: '🥬 Vegetariana' },
    { value: 'VEGANA',      label: '🌱 Vegana'      },
    { value: 'OMNIVORA',    label: '🍖 Omnívora'    }
  ];

  dietasActivas = new Set<TipoDieta>([this.dietaUsuario]);

  gardenPlants: GardenPlant[] = [
    { id: '1', name: 'tomate',   quantity: 5,  unit: 'plantas' },
    { id: '2', name: 'lechuga',  quantity: 10, unit: 'plantas' },
    { id: '3', name: 'albahaca', quantity: 3,  unit: 'plantas' },
    { id: '4', name: 'menta',    quantity: 2,  unit: 'plantas' },
    { id: '5', name: 'pepino',   quantity: 4,  unit: 'plantas' },
    { id: '6', name: 'perejil',  quantity: 3,  unit: 'plantas' },
    { id: '7', name: 'cilantro', quantity: 2,  unit: 'plantas' }
  ];

  constructor(private recipesService: RecipesService) {}

  ngOnInit(): void {
    this.recipes = RECETAS_LOCALES.map(r =>
      this.recipesService.updateGardenCompatibility(r, this.gardenPlants)
    );
    this.applyFilters();
  }

  toggleDieta(dieta: TipoDieta): void {
    if (this.dietasActivas.has(dieta)) {
      this.dietasActivas.delete(dieta);
    } else {
      this.dietasActivas.add(dieta);
    }
    this.dietasActivas = new Set(this.dietasActivas);
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let result = [...this.recipes];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(r =>
        r.nombre_receta.toLowerCase().includes(term) ||
        r.descripcion.toLowerCase().includes(term)
      );
    }

    if (this.dietasActivas.size > 0) {
      result = result.filter(r => this.dietasActivas.has(r.tipo_dieta));
    }

    result.sort((a, b) =>
      this.recipesService.calculateCompatibility(b) -
      this.recipesService.calculateCompatibility(a)
    );

    this.filteredRecipes = result;
  }

  openRecipeDetail(recipe: Recipe): void { this.selectedRecipe = recipe; }
  closeRecipeDetail(): void { this.selectedRecipe = null; }
  getCompatibility(recipe: Recipe): number {
    return this.recipesService.calculateCompatibility(recipe);
  }

  getDietaText(): string {
    const map: Record<TipoDieta, string> = {
      'VEGANA': '🌱 Vegana', 'VEGETARIANA': '🥬 Vegetariana', 'OMNIVORA': '🍖 Omnívora'
    };
    return map[this.dietaUsuario];
  }
}
