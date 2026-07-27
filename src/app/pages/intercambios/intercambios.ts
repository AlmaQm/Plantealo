import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '@angular/fire/auth';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';
import { ChatModalComponent } from '../../shared/components/chat-modal/chat-modal';
import { SelectPlantasComponent, SelectOpcion } from '../../components/select-plantas/select-plantas';
import { IntercambiosService } from '../../services/intercambios';
import { PlantasService } from '../../services/plantas';
import { MensajesService } from '../../services/mensajes';
import { Intercambio, ConversacionResumen } from '../../models/interfaces';

// Mismo patron que la dieta en Configuracion: el select reutilizable es
// numerico, asi que ciudad/verdura se mapean a un indice/id numerico.
// -1 = "Todas" (sin filtro).
const SIN_FILTRO = -1;
const INTERVALO_NO_LEIDOS_MS = 6000;

interface ChatActivo {
  intercambioId: number;
  otroUid: string;
  otroNombre: string;
  nombrePlanta: string;
}

@Component({
  selector: 'app-intercambios',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ChatModalComponent, SelectPlantasComponent],
  templateUrl: './intercambios.html',
  styleUrls: ['./intercambios.scss']
})
export class IntercambiosComponent implements OnDestroy {
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
  readonly noLeidosTotal = signal(0);
  private intervaloNoLeidos?: ReturnType<typeof setInterval>;

  // --- Opciones para app-select-plantas (mismo componente reutilizable
  // que "Añadir planta" y la dieta de Configuración) ---

  readonly opcionesCiudad = computed<SelectOpcion[]>(() => [
    { valor: SIN_FILTRO, etiqueta: 'Todas las ciudades' },
    ...this.ciudades().map((c, i) => ({ valor: i, etiqueta: c })),
  ]);

  readonly opcionesVerdura = computed<SelectOpcion[]>(() => [
    { valor: SIN_FILTRO, etiqueta: 'Todas las verduras' },
    ...this.catalogo().map(p => ({ valor: p.planta_id, etiqueta: p.nombre_planta })),
  ]);

  readonly ciudadIndiceSeleccionado = signal<number>(SIN_FILTRO);
  readonly plantaSeleccionada = signal<number>(SIN_FILTRO);

  get miUid(): string | null {
    return this.auth.currentUser?.uid ?? null;
  }

  constructor() {
    this.intercambiosService.getCiudades()
      .then(ciudades => this.ciudades.set(ciudades))
      .catch(() => this.ciudades.set([]));
    this.cargar();

    this.actualizarNoLeidos();
    this.intervaloNoLeidos = setInterval(() => this.actualizarNoLeidos(), INTERVALO_NO_LEIDOS_MS);
  }

  ngOnDestroy(): void {
    if (this.intervaloNoLeidos) clearInterval(this.intervaloNoLeidos);
  }

  private async actualizarNoLeidos(): Promise<void> {
    try {
      this.noLeidosTotal.set(await this.mensajesService.contarNoLeidos());
    } catch {
      // sin sesión válida todavía u otro error puntual: no interrumpe la página
    }
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

  onCiudadIndiceChange(indice: number): void {
    this.ciudadIndiceSeleccionado.set(indice);
    this.ciudadFiltro.set(indice === SIN_FILTRO ? '' : this.ciudades()[indice]);
    this.cargar();
  }

  onPlantaChange(plantaId: number): void {
    this.plantaSeleccionada.set(plantaId);
    this.plantaFiltro.set(plantaId === SIN_FILTRO ? null : plantaId);
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

  async eliminar(intercambio: Intercambio): Promise<void> {
    const uid = this.miUid;
    if (!uid) return;
    if (!confirm('¿Eliminar esta publicación? No se puede deshacer.')) return;
    try {
      await this.intercambiosService.eliminar(intercambio.id, uid);
      this.lista.update(lista => lista.filter(i => i.id !== intercambio.id));
    } catch (e) {
      console.error('Error al eliminar el intercambio:', e);
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
    // abrir el chat marca sus mensajes como leidos en el backend: refresca el contador.
    this.actualizarNoLeidos();
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

  async eliminarConversacion(c: ConversacionResumen): Promise<void> {
    if (!confirm(`¿Eliminar la conversación con ${c.otro_nombre}? No se puede deshacer.`)) return;
    try {
      await this.mensajesService.eliminarConversacion(c.intercambio_id, c.otro_uid);
      this.conversaciones.update(lista =>
        lista.filter(x => !(x.intercambio_id === c.intercambio_id && x.otro_uid === c.otro_uid))
      );
      this.actualizarNoLeidos();
    } catch (e) {
      console.error('Error al eliminar la conversación:', e);
    }
  }
}
