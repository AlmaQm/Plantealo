import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlantasService, getTipoPlanta } from '../../services/plantas';

import { DatepickerComponent } from '../../components/datepicker/datepicker';
import { SelectPlantasComponent, SelectOpcion } from '../../components/select-plantas/select-plantas';
import { PlantaCardComponent } from '../../shared/components/planta-card/planta-card';


type Filtro = 'TODAS' | 'INTERIOR' | 'EXTERIOR';

@Component({
  selector: 'app-plantas',
  standalone: true,
  imports: [CommonModule, FormsModule, PlantaCardComponent, DatepickerComponent, SelectPlantasComponent],
  templateUrl: './plantas.html',
  styleUrls: ['./plantas.scss']
})
export class PlantasComponent {

  private plantasService = inject(PlantasService);

  readonly catalogo = this.plantasService.catalogo;
  readonly hoy = new Date().toISOString().split('T')[0];

  readonly opcionesPlantas: SelectOpcion[] = this.catalogo.map(p => ({
    valor: p.planta_id,
    etiqueta: p.nombre_planta,
  }));

  filtroActivo = signal<Filtro>('TODAS');
  modalAbierto = signal(false);
  plantaIdSeleccionada = signal<number | null>(null);
  fechaSiembra = signal<string>(this.hoy);

  plantasFiltradas = computed(() => {
    const filtro = this.filtroActivo();
    const inventario = this.plantasService.inventario();
    if (filtro === 'TODAS') return inventario;
    return inventario.filter(p => p.tipo_planta === filtro || p.tipo_planta === 'TODAS');
  });

  setFiltro(filtro: Filtro): void {
    this.filtroActivo.set(filtro);
  }

  abrirModal(): void {
    this.plantaIdSeleccionada.set(null);
    this.fechaSiembra.set(this.hoy);
    this.modalAbierto.set(true);
  }

  cerrarModal(): void {
    this.modalAbierto.set(false);
    this.plantaIdSeleccionada.set(null);
  }

  agregarPlanta(): void {
    const id = this.plantaIdSeleccionada();
    if (id === null) return;
    const planta = this.catalogo.find(p => p.planta_id === +id);
    if (planta) {
      this.plantasService.addPlanta({
        ...planta,
        tipo_planta: getTipoPlanta(planta.nombre_planta),
        f_siembra:   new Date(this.fechaSiembra()),
      });
      this.cerrarModal();
    }
  }
}
