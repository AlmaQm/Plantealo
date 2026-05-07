import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Planta } from '../../../models/interfaces';

@Component({
  selector: 'app-planta-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './planta-card.html',
  styleUrls: ['./planta-card.scss']
})
export class PlantaCardComponent {
  @Input() planta!: Planta;

  expanded = signal(false);

  toggle(): void {
    this.expanded.update(v => !v);
  }

  getEstadoLabel(): string {
    const labels: Record<Planta['estado_crecimiento'], string> = {
      'PLANTADA': 'Plantada',
      'CRECIENDO': 'Creciendo',
      'LISTA': 'Lista'
    };
    return labels[this.planta.estado_crecimiento];
  }

  getProgresoMensaje(): string {
    if (this.planta.progreso < 30) return 'Recién plantada, ¡dale tiempo!';
    if (this.planta.progreso < 70) return 'Creciendo bien, sigue cuidándola';
    if (this.planta.progreso < 100) return 'Casi lista para cosechar';
    return '¡Lista para cosechar!';
  }

  formatFecha(fecha: Date): string {
    return new Date(fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
  }
}
