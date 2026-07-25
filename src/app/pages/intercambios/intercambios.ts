import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '@angular/fire/auth';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';
import { IntercambiosService } from '../../services/intercambios';
import { PlantasService } from '../../services/plantas';
import { Intercambio } from '../../models/interfaces';

@Component({
  selector: 'app-intercambios',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  templateUrl: './intercambios.html',
  styleUrls: ['./intercambios.scss']
})
export class IntercambiosComponent {
  private readonly intercambiosService = inject(IntercambiosService);
  private readonly plantasService = inject(PlantasService);
  private readonly auth = inject(Auth);

  readonly catalogo = this.plantasService.catalogo;

  readonly lista = signal<Intercambio[]>([]);
  readonly cargando = signal(false);
  readonly ciudadFiltro = signal('');
  readonly plantaFiltro = signal<number | null>(null);
  readonly ciudades = signal<string[]>([]);

  get miUid(): string | null {
    return this.auth.currentUser?.uid ?? null;
  }

  constructor() {
    this.intercambiosService.getCiudades()
      .then(ciudades => this.ciudades.set(ciudades))
      .catch(() => this.ciudades.set([]));
    this.cargar();
  }

  async cargar(): Promise<void> {
    this.cargando.set(true);
    try {
      const datos = await this.intercambiosService.listar({
        ciudad: this.ciudadFiltro() || undefined,
        planta_id: this.plantaFiltro() ?? undefined,
      });
      this.lista.set(datos);
    } catch (e) {
      console.error('Error al cargar intercambios:', e);
    } finally {
      this.cargando.set(false);
    }
  }

  onCiudadChange(ciudad: string): void {
    this.ciudadFiltro.set(ciudad);
    this.cargar();
  }

  onPlantaChange(plantaId: number | null): void {
    this.plantaFiltro.set(plantaId);
    this.cargar();
  }

  async cerrar(intercambio: Intercambio): Promise<void> {
    const uid = this.miUid;
    if (!uid) return;
    try {
      await this.intercambiosService.cerrar(intercambio.id, uid);
      this.lista.update(lista => lista.filter(i => i.id !== intercambio.id));
    } catch (e) {
      console.error('Error al cerrar el intercambio:', e);
    }
  }

  formatFecha(fecha: Date): string {
    return new Date(fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }
}
