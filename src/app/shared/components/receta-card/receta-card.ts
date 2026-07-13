import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecetaHuerto } from '../../../models/interfaces';
import { getFaltantesIcono, getFaltantesTexto, getFaltantesClase, formatTiempoPreparacion } from '../../utils/recetas.util';

@Component({
  selector: 'app-receta-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './receta-card.html',
  styleUrls: ['./receta-card.scss']
})
export class RecetaCardComponent {
  @Input() recipe!: RecetaHuerto;
  @Output() recipeClick = new EventEmitter<RecetaHuerto>();

  getTiempo(): string {
    return formatTiempoPreparacion(this.recipe.tiempo_preparacion);
  }

  getCategoriaText(): string {
    const map: Record<string, string> = {
      'ENTRANTE': '🥗 Entrante', 'PRINCIPAL': '🍽️ Principal',
      'POSTRE': '🍰 Postre',    'BEBIDA': '🥤 Bebida'
    };
    return map[this.recipe.categoria ?? ''] ?? this.recipe.categoria ?? '';
  }

  getFaltantesIcono(): string {
    return getFaltantesIcono(this.recipe.ingredientes_faltantes);
  }

  getFaltantesTexto(): string {
    return getFaltantesTexto(this.recipe.ingredientes_faltantes);
  }

  getFaltantesClase(): string {
    return getFaltantesClase(this.recipe.ingredientes_faltantes);
  }

  onCardClick(): void {
    this.recipeClick.emit(this.recipe);
  }
}
