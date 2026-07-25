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

  // Cosechada (f_cosecha marcado) manda sobre el estado calculado por fechas:
  // aunque siga "a tiempo" de estar lista, si ya se marcó como cosechada se
  // muestra como tal. Si no se ha marcado el check, sigue como Lista/Creciendo/etc.
  estadoLabel(planta: Planta): string {
    if (planta.f_cosecha) return 'Cosechada';
    return ESTADO_LABEL[calcularEstado(planta)];
  }

  estadoClase(planta: Planta): string {
    if (planta.f_cosecha) return 'cosechada';
    return calcularEstado(planta).toLowerCase();
  }

  formatFecha(fecha: Date | undefined | null): string {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
  }
}
