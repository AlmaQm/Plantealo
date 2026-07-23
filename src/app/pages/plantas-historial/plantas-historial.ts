import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlantasService, calcularEstado } from '../../services/plantas';
import { Planta } from '../../models/interfaces';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';

const ESTADO_LABEL: Record<Planta['estado'], string> = {
  PLANTADA: 'Plantada',
  CRECIENDO: 'Creciendo',
  LISTA: 'Lista',
  ENFERMA: 'Enferma',
};

@Component({
  selector: 'app-plantas-historial',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent],
  templateUrl: './plantas-historial.html',
  styleUrls: ['./plantas-historial.scss']
})
export class PlantasHistorialComponent {
  private readonly plantasService = inject(PlantasService);

  readonly inventario = this.plantasService.inventario;

  estadoLabel(planta: Planta): string {
    return ESTADO_LABEL[calcularEstado(planta)];
  }

  formatFecha(fecha: Date | undefined | null): string {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
  }
}
