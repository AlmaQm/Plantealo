// src/app/pages/recetas/recetas.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecipesService } from '../../services/recipes';
import { RecetaCardComponent } from '../../shared/components/receta-card/receta-card';
import { RecetaWindowComponent } from '../../shared/components/receta-window/receta-window';
import { Recipe, Usuario, GardenPlant } from '../../models/interfaces';

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
  
  // Búsqueda
  searchTerm: string = '';
  
  // Usuario logueado (esto vendría de un servicio de autenticación)
  currentUser: Usuario = {
    usuarioid: '1',
    nombre: 'Usuario Test',
    email: 'test@example.com',
    tipo_dieta: 'vegetariana', // esto cambiaría según el usuario
    recetasGuardadasIds: []
  };
  
  // Datos del huerto
  gardenPlants: GardenPlant[] = [
    { id: '1', name: 'tomate', quantity: 5, unit: 'plantas' },
    { id: '2', name: 'lechuga', quantity: 10, unit: 'plantas' },
    { id: '3', name: 'albahaca', quantity: 3, unit: 'plantas' },
    { id: '4', name: 'menta', quantity: 2, unit: 'plantas' },
    { id: '5', name: 'pepino', quantity: 4, unit: 'plantas' },
    { id: '6', name: 'perejil', quantity: 3, unit: 'plantas' },
    { id: '7', name: 'cilantro', quantity: 2, unit: 'plantas' }
  ];

  constructor(private recipesService: RecipesService) {}

  ngOnInit(): void {
    this.loadRecipes();
  }

  loadRecipes(): void {
    this.loading = true;
    this.recipesService.getRecipesByUserDiet(this.currentUser).subscribe({
      next: (recipes) => {
        // Actualizar compatibilidad con el huerto
        this.recipes = recipes.map(recipe => 
          this.recipesService.updateGardenCompatibility(recipe, this.gardenPlants)
        );
        this.applySearch();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading recipes:', error);
        this.loading = false;
      }
    });
  }

  applySearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredRecipes = [...this.recipes];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredRecipes = this.recipes.filter(recipe =>
        recipe.name.toLowerCase().includes(term) ||
        recipe.description.toLowerCase().includes(term)
      );
    }
    
    // Ordenar por compatibilidad
    this.filteredRecipes.sort((a, b) => {
      const compatA = this.recipesService.calculateCompatibility(a);
      const compatB = this.recipesService.calculateCompatibility(b);
      return compatB - compatA;
    });
  }

  onSearchChange(): void {
    this.applySearch();
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
  
  // Método para obtener el texto del tipo de dieta
  getDietaText(): string {
    const dietas = {
      'vegana': '🌱 Vegana',
      'vegetariana': '🥬 Vegetariana',
      'omnivora': '🍖 Omnívora'
    };
    return dietas[this.currentUser.tipo_dieta];
  }
}