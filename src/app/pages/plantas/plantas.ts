import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlantasService, getTipoPlanta, diasHastaCosecha } from '../../services/plantas';

import { DatepickerComponent } from '../../components/datepicker/datepicker';
import { SelectPlantasComponent, SelectOpcion } from '../../components/select-plantas/select-plantas';
import { PlantaCardComponent } from '../../shared/components/planta-card/planta-card';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';


type Filtro = 'TODAS' | 'INTERIOR' | 'EXTERIOR';

@Component({
  selector: 'app-plantas',
  standalone: true,
  imports: [CommonModule, FormsModule, PlantaCardComponent, DatepickerComponent, SelectPlantasComponent, PageHeaderComponent],
  templateUrl: './plantas.html',
  styleUrls: ['./plantas.scss']
})
export class PlantasComponent {

  private plantasService = inject(PlantasService);

  readonly catalogo = this.plantasService.catalogo;
  readonly hoy = new Date().toISOString().split('T')[0];

  readonly opcionesPlantas = computed<SelectOpcion[]>(() =>
    this.catalogo().map(p => ({ valor: p.planta_id, etiqueta: p.nombre_planta }))
  );

  filtroActivo = signal<Filtro>('TODAS');
  modalAbierto = signal(false);
  plantaIdSeleccionada = signal<number | null>(null);
  fechaSiembra = signal<string>(this.hoy);

  plantasFiltradas = computed(() => {
    const filtro = this.filtroActivo();
    // Una vez cosechada (f_cosecha marcado desde el Home) la planta deja de estar
    // activa en el huerto: desaparece de aquí pero sigue viéndose en el historial
    // del perfil, que lee el mismo inventario sin este filtro.
    const inventario = this.plantasService.inventario().filter(p => !p.f_cosecha);
    if (filtro === 'TODAS') return inventario;
    return inventario.filter(p =>
      p.tipo_planta === filtro ||
      p.tipo_planta === 'TODAS' ||
      (filtro === 'EXTERIOR' && p.tipo_planta === 'HUERTO')
    );
  });

  setFiltro(filtro: Filtro): void {
    this.filtroActivo.set(filtro);
  }

  // app-select-plantas admite valores numéricos o de texto (lo necesita el
  // selector de categoría de Comunidad); esta lista de plantas concreta
  // siempre usa IDs numéricos, así que aquí simplemente lo recuperamos como number.
  onPlantaIdChange(valor: number | string): void {
    this.plantaIdSeleccionada.set(Number(valor));
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
    const planta = this.catalogo().find(p => p.planta_id === +id);
    if (planta) {
      const f_siembra = new Date(this.fechaSiembra());
      const f_recogida = new Date(f_siembra);
      f_recogida.setDate(f_recogida.getDate() + diasHastaCosecha(planta.nombre_planta));

      this.plantasService.addPlanta({
        id: 0,
        planta_id: planta.planta_id,
        usuario_id: 0,
        nombre_planta: planta.nombre_planta,
        imagen_url: planta.imagen_url ?? 'assets/images/placeholder.jpg',
        tipo_planta: getTipoPlanta(planta.nombre_planta),
        f_siembra,
        f_recogida,
        estado: 'PLANTADA',
        clima: planta.clima ?? undefined,
      });
      this.cerrarModal();
    }
  }
}
