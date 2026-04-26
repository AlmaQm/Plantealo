// src/app/services/recipes.service.ts

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Recipe, Ingredient, Usuario, GardenPlant } from '../models/interfaces';
import { RECETAS_LOCALES } from '../data/recetas-locales';

@Injectable({
  providedIn: 'root'
})
export class RecipesService {
  
  constructor() {}

  // Obtener recetas según el tipo de dieta del usuario
  getRecipesByUserDiet(usuario: Usuario): Observable<Recipe[]> {
    const filteredRecipes = RECETAS_LOCALES.filter(recipe => 
      recipe.type_dieta.includes(usuario.tipo_dieta)
    );
    return of(filteredRecipes).pipe(delay(300)); // simular delay de red
  }

  // Obtener todas las recetas (sin filtro)
  getAllRecipes(): Observable<Recipe[]> {
    return of(RECETAS_LOCALES).pipe(delay(300));
  }

  // Obtener receta por ID
  getRecipeById(id: string): Observable<Recipe | undefined> {
    const recipe = RECETAS_LOCALES.find(r => r.id === id);
    return of(recipe).pipe(delay(100));
  }

  // Actualizar compatibilidad con el huerto
  updateGardenCompatibility(recipe: Recipe, gardenPlants: GardenPlant[]): Recipe {
    const updatedRecipe = { ...recipe };
    const gardenPlantNames = new Map(
      gardenPlants.map(p => [p.name.toLowerCase(), p.name])
    );
    
    updatedRecipe.ingredients = recipe.ingredients.map(ingredient => {
      const ingredientLower = ingredient.name.toLowerCase();
      let matchFound = false;
      let matchedPlant = '';
      
      for (const [plantName, originalName] of gardenPlantNames) {
        if (ingredientLower.includes(plantName) || plantName.includes(ingredientLower)) {
          matchFound = true;
          matchedPlant = originalName;
          break;
        }
      }
      
      return {
        ...ingredient,
        isFromGarden: matchFound,
        gardenPlantMatch: matchedPlant || undefined
      };
    });
    
    return updatedRecipe;
  }

  // Calcular porcentaje de compatibilidad
  calculateCompatibility(recipe: Recipe): number {
    if (recipe.ingredients.length === 0) return 0;
    const gardenIngredients = recipe.ingredients.filter(i => i.isFromGarden).length;
    return Math.round((gardenIngredients / recipe.ingredients.length) * 100);
  }

  // Obtener recetas destacadas (basadas en temporada y compatibilidad)
  getFeaturedRecipes(usuario: Usuario, gardenPlants: GardenPlant[], limit: number = 4): Observable<Recipe[]> {
    return this.getRecipesByUserDiet(usuario).pipe(
      map(recipes => {
        // Actualizar compatibilidad
        const recipesWithCompat = recipes.map(r => this.updateGardenCompatibility(r, gardenPlants));
        // Ordenar por compatibilidad
        const sorted = recipesWithCompat.sort((a, b) => 
          this.calculateCompatibility(b) - this.calculateCompatibility(a)
        );
        return sorted.slice(0, limit);
      })
    );
  }

  // Buscar recetas por término
  searchRecipes(usuario: Usuario, searchTerm: string): Observable<Recipe[]> {
    return this.getRecipesByUserDiet(usuario).pipe(
      map(recipes => 
        recipes.filter(r => 
          r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    );
  }

  // Guardar receta en favoritos
  saveRecipe(usuario: Usuario, recipeId: string): Usuario {
    if (!usuario.recetasGuardadasIds.includes(recipeId)) {
      usuario.recetasGuardadasIds.push(recipeId);
    }
    return usuario;
  }

  // Obtener recetas guardadas
  getSavedRecipes(usuario: Usuario): Observable<Recipe[]> {
    const savedRecipes = RECETAS_LOCALES.filter(r => 
      usuario.recetasGuardadasIds.includes(r.id)
    );
    return of(savedRecipes);
  }
}