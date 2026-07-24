import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecetaHuerto, IngredienteEstado } from '../../../models/interfaces';
import { getFaltantesTexto, getFaltantesClase, formatTiempoPreparacion } from '../../utils/recetas.util';
import {
  LucideX, LucideClock, LucideUsers, LucideChartColumn,
  LucideLeaf, LucideSalad, LucideBeef, LucideUtensilsCrossed, LucideCakeSlice, LucideCupSoda,
  LucideCircleCheck, LucideCircleAlert, LucideCircleX,
  LucideShoppingBasket, LucideNotebookText, LucideChefHat, LucideSparkles
} from '@lucide/angular';

@Component({
  selector: 'app-receta-window',
  standalone: true,
  imports: [
    CommonModule,
    LucideX, LucideClock, LucideUsers, LucideChartColumn,
    LucideLeaf, LucideSalad, LucideBeef, LucideUtensilsCrossed, LucideCakeSlice, LucideCupSoda,
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
    const map: Record<string, string> = {
      'ENTRANTE': 'Entrante', 'PRINCIPAL': 'Principal',
      'POSTRE': 'Postre',    'BEBIDA': 'Bebida'
    };
    return map[this.recipe?.categoria ?? ''] ?? this.recipe?.categoria ?? '';
  }

  getDietaText(): string {
    const map: Record<string, string> = {
      'VEGANA': 'Vegana', 'VEGETARIANA': 'Vegetariana', 'OMNIVORA': 'Omnívora'
    };
    return map[this.recipe?.tipo_dieta ?? ''] ?? '';
  }

  getFaltantesTexto(): string {
    return this.recipe ? getFaltantesTexto(this.recipe.ingredientes_faltantes) : '';
  }

  getFaltantesClase(): string {
    return this.recipe ? getFaltantesClase(this.recipe.ingredientes_faltantes) : '';
  }

  getClaseIngrediente(ingrediente: IngredienteEstado): string {
    return ingrediente.disponible ? 'ingrediente--disponible' : 'ingrediente--faltante';
  }

  onImageError(): void {
    const placeholder = 'assets/images/placeholder-receta.jpg';
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
