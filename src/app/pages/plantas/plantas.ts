import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlantasService } from '../../services/plantas';
import { PlantaCardComponent } from '../../shared/components/planta-card/planta-card';

type Filtro = 'TODAS' | 'INTERIOR' | 'EXTERIOR';

@Component({
  selector: 'app-plantas',
  standalone: true,
  imports: [CommonModule, PlantaCardComponent],
  templateUrl: './plantas.html',
  styleUrls: ['./plantas.scss']
})
export class PlantasComponent {

  private plantasService = inject(PlantasService);

  filtroActivo = signal<Filtro>('TODAS');

  plantasFiltradas = computed(() => {
    const filtro = this.filtroActivo();
    const todas = this.plantasService.plantas();
    if (filtro === 'TODAS') return todas;
    return todas.filter(p => p.tipo_planta === filtro || p.tipo_planta === 'TODAS');
  });

  setFiltro(filtro: Filtro): void {
    this.filtroActivo.set(filtro);
  }
}
