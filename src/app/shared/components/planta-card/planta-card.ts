import { Component, Input, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Planta } from '../../../models/interfaces';
import { PlantasService } from '../../../services/plantas';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal';

@Component({
  selector: 'app-planta-card',
  standalone: true,
  imports: [CommonModule, ConfirmModalComponent],
  templateUrl: './planta-card.html',
  styleUrls: ['./planta-card.scss']
})
export class PlantaCardComponent {
  private plantasService = inject(PlantasService);

  @Input() planta!: Planta;

  expanded = signal(false);
  mostrarConfirm = signal(false);

  toggle(): void {
    this.expanded.update(v => !v);
  }

  eliminar(event: Event): void {
    event.stopPropagation(); // evita que s'expandeixi la card
    this.mostrarConfirm.set(true);
  }

  confirmarEliminar(): void {
    this.plantasService.deletePlanta(this.planta.planta_id);
    this.mostrarConfirm.set(false);
  }

  cancelarEliminar(): void {
    this.mostrarConfirm.set(false);
  }

  getEstadoLabel(): string {
    const labels: Record<Planta['estado'], string> = {
      'PLANTADA': 'Plantada',
      'CRECIENDO': 'Creciendo',
      'LISTA': 'Lista',
      'ENFERMA': 'Enferma'
    };
    return labels[this.planta.estado];
  }

  getProgreso(): number {
    const today = new Date();
    const start = new Date(this.planta.f_siembra);
    const end = new Date(this.planta.f_recogida);
    const total = end.getTime() - start.getTime();
    const elapsed = today.getTime() - start.getTime();
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
  }

  getProgresoMensaje(): string {
    const p = this.getProgreso();
    if (this.planta.estado === 'ENFERMA') return 'Necesita atención urgente';
    if (p < 30) return 'Recién plantada, ¡dale tiempo!';
    if (p < 70) return 'Creciendo bien, sigue cuidándola';
    if (p < 100) return 'Casi lista para cosechar';
    return '¡Lista para cosechar!';
  }

  formatFecha(fecha: Date): string {
    return new Date(fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
  }
}
