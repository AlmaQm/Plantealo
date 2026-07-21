import { Injectable } from '@angular/core';
import { Recipe, GardenPlant } from '../models/interfaces';
// import { RECETAS_LOCALES } from '../data/recetas-locales'; // deshabilitado: el archivo no tiene exports (TS2306)
const RECETAS_LOCALES: Recipe[] = [];

@Injectable({
  providedIn: 'root'
})
export class RecipesService {

  getAllRecipes(): Recipe[] {
    return RECETAS_LOCALES;
  }

  updateGardenCompatibility(recipe: Recipe, gardenPlants: GardenPlant[]): Recipe {
    const gardenNames = new Map(
      gardenPlants.map(p => [p.name.toLowerCase(), p.name])
    );

    const updatedIngredientes = recipe.ingredientes.map(ing => {
      const lower = ing.nombre_ingrediente.toLowerCase();
      let matchFound = false;
      let matchedPlant = '';

      for (const [plantName, originalName] of gardenNames) {
        if (lower.includes(plantName) || plantName.includes(lower)) {
          matchFound = true;
          matchedPlant = originalName;
          break;
        }
      }

      return { ...ing, isFromGarden: matchFound, gardenPlantMatch: matchedPlant || undefined };
    });

    return { ...recipe, ingredientes: updatedIngredientes };
  }

  calculateCompatibility(recipe: Recipe): number {
    if (recipe.ingredientes.length === 0) return 0;
    const fromGarden = recipe.ingredientes.filter(i => i.isFromGarden).length;
    return Math.round((fromGarden / recipe.ingredientes.length) * 100);
  }
}
