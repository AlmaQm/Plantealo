import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '@angular/fire/auth';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';
import { ChatModalComponent } from '../../shared/components/chat-modal/chat-modal';
import { IntercambiosService } from '../../services/intercambios';
import { PlantasService } from '../../services/plantas';
import { MensajesService } from '../../services/mensajes';
import { Intercambio, ConversacionResumen } from '../../models/interfaces';

interface ChatActivo {
  intercambioId: number;
  otroUid: string;
  otroNombre: string;
  nombrePlanta: string;
}

@Component({
  selector: 'app-intercambios',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent, ChatModalComponent],
  templateUrl: './intercambios.html',
  styleUrls: ['./intercambios.scss']
})
export class IntercambiosComponent {
  private readonly intercambiosService = inject(IntercambiosService);
  private readonly plantasService = inject(PlantasService);
  private readonly mensajesService = inject(MensajesService);
  private readonly auth = inject(Auth);

  readonly catalogo = this.plantasService.catalogo;

  readonly lista = signal<Intercambio[]>([]);
  readonly cargando = signal(false);
  readonly ciudadFiltro = signal('');
  readonly plantaFiltro = signal<number | null>(null);
  readonly ciudades = signal<string[]>([]);

  readonly chatActivo = signal<ChatActivo | null>(null);
  readonly conversacionesAbierto = signal(false);
  readonly conversaciones = signal<ConversacionResumen[]>([]);
  readonly cargandoConversaciones = signal(false);

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

  // --- Chat ---

  abrirChatDesdeTarjeta(i: Intercambio): void {
    this.chatActivo.set({
      intercambioId: i.id,
      otroUid: i.usuario_id,
      otroNombre: i.nombre_usuario,
      nombrePlanta: i.nombre_planta,
    });
  }

  abrirChatDesdeConversacion(c: ConversacionResumen): void {
    this.chatActivo.set({
      intercambioId: c.intercambio_id,
      otroUid: c.otro_uid,
      otroNombre: c.otro_nombre,
      nombrePlanta: c.nombre_planta,
    });
    this.conversacionesAbierto.set(false);
  }

  cerrarChat(): void {
    this.chatActivo.set(null);
  }

  async abrirConversaciones(): Promise<void> {
    this.conversacionesAbierto.set(true);
    this.cargandoConversaciones.set(true);
    try {
      this.conversaciones.set(await this.mensajesService.listarConversaciones());
    } catch (e) {
      console.error('Error al cargar las conversaciones:', e);
      this.conversaciones.set([]);
    } finally {
      this.cargandoConversaciones.set(false);
    }
  }

  cerrarConversaciones(): void {
    this.conversacionesAbierto.set(false);
  }
}
