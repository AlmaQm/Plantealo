import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecetaHuerto, IngredienteEstado } from '../../../models/interfaces';
import { getFaltantesTexto, getFaltantesClase, formatTiempoPreparacion } from '../../utils/recetas.util';
import {
  LucideX, LucideClock, LucideUsers, LucideChartColumn,
  LucideLeaf, LucideSalad, LucideBeef, LucideUtensilsCrossed,
  LucideCircleCheck, LucideCircleAlert, LucideCircleX,
  LucideShoppingBasket, LucideNotebookText, LucideChefHat, LucideSparkles
} from '@lucide/angular';

@Component({
  selector: 'app-receta-window',
  standalone: true,
  imports: [
    CommonModule,
    LucideX, LucideClock, LucideUsers, LucideChartColumn,
    LucideLeaf, LucideSalad, LucideBeef, LucideUtensilsCrossed,
    LucideCircleCheck, LucideCircleAlert, LucideCircleX,
    LucideShoppingBasket, LucideNotebookText, LucideChefHat, LucideSparkles
  ],
  templateUrl: './receta-window.html',
  styleUrls: ['./receta-window.scss']
})
export class RecetaWindowComponent {
  @Input() recipe: RecetaHuerto | null = null;
  @Output() close = new EventEmitter<void>();

  getTiempo(): string {
    return formatTiempoPreparacion(this.recipe?.tiempo_preparacion);
  }

  getCategoriaText(): string {
    const categoria = this.recipe?.categoria ?? '';
    if (!categoria) return '';
    return categoria.charAt(0).toUpperCase() + categoria.slice(1).toLowerCase();
  }

  getDietaText(): string {
    const map: Record<string, string> = {
      'VEGANA': 'Vegana', 'VEGETARIANA': 'Vegetariana', 'OMNIVORA': 'Omnívora'
    };
    return map[this.recipe?.tipo_dieta ?? ''] ?? '';
  }

  getFaltantesTexto(): string {
    return this.recipe ? getFaltantesTexto(this.recipe.ingredientes_faltantes, this.recipe.tiene_ingredientes_registrados) : '';
  }

  getFaltantesClase(): string {
    return this.recipe ? getFaltantesClase(this.recipe.ingredientes_faltantes, this.recipe.tiene_ingredientes_registrados) : '';
  }

  get ingredientesDisponibles(): IngredienteEstado[] {
    return this.recipe?.ingredientes?.filter(ing => ing.disponible) ?? [];
  }

  get ingredientesFaltantes(): IngredienteEstado[] {
    return this.recipe?.ingredientes?.filter(ing => !ing.disponible) ?? [];
  }

  onImageError(): void {
    const placeholder = 'assets/images/logo-plantealo.svg';
    if (this.recipe && this.recipe.imagen_url !== placeholder) {
      this.recipe.imagen_url = placeholder;
    }
  }

  onClose(): void { this.close.emit(); }

  handleOutsideClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('receta-window')) {
      this.onClose();
    }
  }
}
