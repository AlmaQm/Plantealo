import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { MealAPIResponse, Recipe, Ingredient, GardenPlant } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class RecipesService {
  private apiBaseUrl = 'https://www.themealdb.com/api/json/v1/1';
  
  // Ingredientes vegetarianos comunes (excluye carne/pescado)
  private vegetarianIngredients = new Set([
    'vegetables', 'tomato', 'onion', 'garlic', 'potato', 'rice', 'pasta',
    'bread', 'cheese', 'egg', 'milk', 'butter', 'oil', 'salt', 'pepper',
    'herbs', 'spices', 'mushroom', 'bean', 'lentil', 'tofu', 'tempeh',
    'carrot', 'celery', 'pepper', 'spinach', 'lettuce', 'cucumber',
    'avocado', 'olive', 'lemon', 'lime', 'apple', 'banana', 'berry',
    'flour', 'sugar', 'honey', 'maple syrup', 'yogurt', 'cream'
  ]);
  
  private nonVegetarianKeywords = new Set([
    'chicken', 'beef', 'pork', 'fish', 'salmon', 'tuna', 'shrimp', 'prawn',
    'lamb', 'bacon', 'sausage', 'ham', 'turkey', 'duck', 'meat', 'steak',
    'veal', 'rabbit', 'goat', 'anchovies', 'sardines', 'calamari', 'octopus',
    'mussel', 'clam', 'oyster', 'crab', 'lobster', 'scallop'
  ]);

  constructor(private http: HttpClient) {}

  // Obtener todas las recetas (categoría vegetariana)
  getRecipes(): Observable<Recipe[]> {
    // Podemos buscar por categoría 'Vegetarian'
    return this.http.get<MealAPIResponse>(`${this.apiBaseUrl}/filter.php?c=Vegetarian`)
      .pipe(
        map(response => response.meals || []),
        map(meals => meals.map(meal => this.transformToRecipe(meal)))
      );
  }

  // Buscar recetas por nombre
  searchRecipes(searchTerm: string): Observable<Recipe[]> {
    return this.http.get<MealAPIResponse>(`${this.apiBaseUrl}/search.php?s=${searchTerm}`)
      .pipe(
        map(response => response.meals || []),
        map(meals => meals.map(meal => this.transformToRecipe(meal)))
      );
  }

  // Obtener receta por ID
  getRecipeById(id: string): Observable<Recipe | null> {
    return this.http.get<MealAPIResponse>(`${this.apiBaseUrl}/lookup.php?i=${id}`)
      .pipe(
        map(response => response.meals?.[0] || null),
        map(meal => meal ? this.transformToRecipe(meal) : null)
      );
  }

  // Obtener recetas por categoría
  getRecipesByCategory(category: string): Observable<Recipe[]> {
    return this.http.get<MealAPIResponse>(`${this.apiBaseUrl}/filter.php?c=${category}`)
      .pipe(
        map(response => response.meals || []),
        map(meals => meals.map(meal => this.transformToRecipe(meal)))
      );
  }

  // Transformar API response a nuestra interfaz Recipe
  private transformToRecipe(meal: any): Recipe {
    const ingredients: Ingredient[] = [];
    
    // Extraer ingredientes y medidas
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      
      if (ingredient && ingredient.trim() !== '') {
        ingredients.push({
          name: ingredient.trim().toLowerCase(),
          measure: measure?.trim() || '',
          isFromGarden: false // Se actualizará después con los datos del huerto
        });
      }
    }

    const isVegetarian = this.checkIfVegetarian(ingredients.map(i => i.name));

    return {
      id: meal.idMeal,
      name: meal.strMeal,
      category: meal.strCategory || '',
      area: meal.strArea || '',
      instructions: meal.strInstructions || '',
      imageUrl: meal.strMealThumb,
      tags: meal.strTags?.split(',') || [],
      youtubeUrl: meal.strYoutube || null,
      ingredients: ingredients,
      isVegetarian: isVegetarian
    };
  }

  // Verificar si la receta es vegetariana
  private checkIfVegetarian(ingredients: string[]): boolean {
    for (const ingredient of ingredients) {
      const lowerIngredient = ingredient.toLowerCase();
      for (const nonVeg of this.nonVegetarianKeywords) {
        if (lowerIngredient.includes(nonVeg)) {
          return false;
        }
      }
    }
    return true;
  }

  // Actualizar compatibilidad con el huerto del usuario
  updateGardenCompatibility(recipe: Recipe, gardenPlants: GardenPlant[]): Recipe {
    const updatedRecipe = { ...recipe };
    const gardenPlantNames = new Set(gardenPlants.map(p => p.name.toLowerCase()));
    
    updatedRecipe.ingredients = recipe.ingredients.map(ingredient => ({
      ...ingredient,
      isFromGarden: gardenPlantNames.has(ingredient.name) || 
                     this.checkIngredientMatch(ingredient.name, gardenPlantNames)
    }));
    
    return updatedRecipe;
  }

  // Verificar si un ingrediente coincide con una planta del huerto
  private checkIngredientMatch(ingredient: string, gardenPlants: Set<string>): boolean {
    const ingredientLower = ingredient.toLowerCase();
    for (const plant of gardenPlants) {
      if (ingredientLower.includes(plant) || plant.includes(ingredientLower)) {
        return true;
      }
    }
    return false;
  }

  // Calcular porcentaje de compatibilidad
  calculateCompatibility(recipe: Recipe): number {
    if (recipe.ingredients.length === 0) return 0;
    const gardenIngredients = recipe.ingredients.filter(i => i.isFromGarden).length;
    return Math.round((gardenIngredients / recipe.ingredients.length) * 100);
  }

  // Obtener recetas destacadas (aleatorias)
  getFeaturedRecipes(count: number = 4): Observable<Recipe[]> {
    return this.getRecipes().pipe(
      map(recipes => {
        const shuffled = [...recipes];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled.slice(0, count);
      })
    );
  }
}