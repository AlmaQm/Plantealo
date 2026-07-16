import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecetaHuerto } from '../../../models/interfaces';
import { RecetasService } from '../../../services/recetas.service';
import { getFaltantesIcono, getFaltantesTexto, getFaltantesClase, formatTiempoPreparacion } from '../../utils/recetas.util';

@Component({
  selector: 'app-receta-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './receta-card.html',
  styleUrls: ['./receta-card.scss']
})
export class RecetaCardComponent {
  private readonly recetasService = inject(RecetasService);

  @Input() recipe!: RecetaHuerto;
  @Input() usuarioId!: number;
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

  toggleGuardar(event: Event): void {
    event.stopPropagation();

    const estabaGuardada = !!this.recipe.guardada;
    // Optimistic update: refleja el cambio al instante, antes de confirmar con el servidor.
    this.recipe.guardada = !estabaGuardada;

    const peticion = estabaGuardada
      ? this.recetasService.desguardarReceta(this.usuarioId, this.recipe.id_receta)
      : this.recetasService.guardarReceta(this.usuarioId, this.recipe.id_receta);

    peticion.subscribe({
      error: (err) => {
        console.error('Error al guardar/desguardar la receta:', err);
        this.recipe.guardada = estabaGuardada; // revierte si falla
      }
    });
  }
}
