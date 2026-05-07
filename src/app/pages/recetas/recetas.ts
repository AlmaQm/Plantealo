import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecipesService } from '../../services/recipes';
import { RecetaCardComponent } from '../../shared/components/receta-card/receta-card';
import { RecetaWindowComponent } from '../../shared/components/receta-window/receta-window';
import { Recipe, Usuario, GardenPlant } from '../../models/interfaces';
import { RECETAS_LOCALES } from '../../data/recetas-locales';

type TipoDieta = 'vegetariana' | 'vegana' | 'omnivora';

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
  loading: boolean = false;
  searchTerm: string = '';

  // Dieta simulada del usuario registrado
  readonly dietaUsuario: TipoDieta = 'vegetariana';

  readonly dietaChips: { value: TipoDieta; label: string }[] = [
    { value: 'vegetariana', label: '🥬 Vegetariana' },
    { value: 'vegana',      label: '🌱 Vegana'      },
    { value: 'omnivora',    label: '🍖 Omnívora'    }
  ];

  dietasActivas = new Set<TipoDieta>([this.dietaUsuario]);

  currentUser: Usuario = {
    usuarioid: '1',
    nombre: 'Usuario Test',
    email: 'test@example.com',
    tipo_dieta: this.dietaUsuario,
    recetasGuardadasIds: []
  };

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
    this.recipes = RECETAS_LOCALES.map(recipe =>
      this.recipesService.updateGardenCompatibility(recipe, this.gardenPlants)
    );
    this.applyFilters();
  }

  toggleDieta(dieta: TipoDieta): void {
    if (this.dietasActivas.has(dieta)) {
      this.dietasActivas.delete(dieta);
    } else {
      this.dietasActivas.add(dieta);
    }
    // Forzar detección de cambios en el Set
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
        r.name.toLowerCase().includes(term) ||
        r.description.toLowerCase().includes(term)
      );
    }

    if (this.dietasActivas.size > 0) {
      result = result.filter(r =>
        r.type_dieta.some(d => this.dietasActivas.has(d as TipoDieta))
      );
    }

    result.sort((a, b) =>
      this.recipesService.calculateCompatibility(b) -
      this.recipesService.calculateCompatibility(a)
    );

    this.filteredRecipes = result;
  }

  openRecipeDetail(recipe: Recipe): void {
    this.selectedRecipe = recipe;
  }

  closeRecipeDetail(): void {
    this.selectedRecipe = null;
  }

  getCompatibility(recipe: Recipe): number {
    return this.recipesService.calculateCompatibility(recipe);
  }

  getDietaText(): string {
    const dietas: Record<TipoDieta, string> = {
      'vegana': '🌱 Vegana',
      'vegetariana': '🥬 Vegetariana',
      'omnivora': '🍖 Omnívora'
    };
    return dietas[this.dietaUsuario];
  }
}
