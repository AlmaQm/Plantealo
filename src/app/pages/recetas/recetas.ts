import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecipesService } from '../../services/recipes';
import { RecetaCardComponent } from '../../shared/components/receta-card/receta-card';
import { RecetaWindowComponent } from '../../shared/components/receta-window/receta-window';
import { Recipe, GardenPlant } from '../../models/interfaces';

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
  loading: boolean = true;
  
  // Filtros
  vegetarianOnly: boolean = false;
  searchTerm: string = '';
  
  // Datos del huerto (ejemplo - reemplazar con servicio real)
  gardenPlants: GardenPlant[] = [
    { id: '1', name: 'tomate', quantity: 5, unit: 'plantas' },
    { id: '2', name: 'lechuga', quantity: 10, unit: 'plantas' },
    { id: '3', name: 'albahaca', quantity: 3, unit: 'plantas' },
    { id: '4', name: 'menta', quantity: 2, unit: 'plantas' },
    { id: '5', name: 'pepino', quantity: 4, unit: 'plantas' }
  ];

  constructor(private recipesService: RecipesService) {}

  ngOnInit(): void {
    this.loadRecipes();
  }

  loadRecipes(): void {
    this.loading = true;
    this.recipesService.getRecipes().subscribe({
      next: (recipes) => {
        // Actualizar compatibilidad con el huerto
        this.recipes = recipes.map(recipe => 
          this.recipesService.updateGardenCompatibility(recipe, this.gardenPlants)
        );
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading recipes:', error);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredRecipes = this.recipes.filter(recipe => {
      // Filtro vegetariano
      if (this.vegetarianOnly && !recipe.isVegetarian) {
        return false;
      }
      
      // Filtro búsqueda
      if (this.searchTerm && !recipe.name.toLowerCase().includes(this.searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    });
    
    // Ordenar por compatibilidad (mayor primero)
    this.filteredRecipes.sort((a, b) => {
      const compatA = this.recipesService.calculateCompatibility(a);
      const compatB = this.recipesService.calculateCompatibility(b);
      return compatB - compatA;
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onVegetarianFilterChange(): void {
    this.applyFilters();
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
}