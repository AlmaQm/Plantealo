import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlantasService, calcularEstado, diasRestantes, diasHastaProximoRiego, esHoy } from '../../services/plantas';
import { AuthService } from '../../services/auth';
import { IntercambiosService } from '../../services/intercambios';
import { GardenTask, Planta } from '../../models/interfaces';

import { WeatherCardComponent } from '../../components/weather-card/weather-card';
import { CalendarWeekComponent } from '../../components/calendar-week/calendar-week';
import { TaskItemComponent } from '../../components/task-item/task-item';
import { SummaryCardComponent } from '../../components/summary-card/summary-card';
import { DietRecommendationsComponent } from '../../components/diet-recommendations/diet-recommendations';
import { SobraCosechaModalComponent, SobraCosechaDatos } from '../../shared/components/sobra-cosecha-modal/sobra-cosecha-modal';

const ICONOS: Record<string, string> = {
  LISTA:     '🌾',
  CRECIENDO: '💧',
  PLANTADA:  '🌱',
  ENFERMA:   '⚠️',
};

const URGENCIA: Record<string, number> = {
  ENFERMA: 0, LISTA: 1, CRECIENDO: 2, PLANTADA: 3,
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    WeatherCardComponent,
    CalendarWeekComponent,
    TaskItemComponent,
    SummaryCardComponent,
    DietRecommendationsComponent,
    SobraCosechaModalComponent,
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent {
  private plantasService = inject(PlantasService);
  private authService = inject(AuthService);
  private intercambiosService = inject(IntercambiosService);
  // Ids marcados como hechos: para enferma es el único estado (no hay campo en el
  // backend todavía); para riego/cosecha da el feedback visual instantáneo (tachado) al
  // hacer click, antes de que el backend confirme — luego, mientras sea el mismo día,
  // se sigue viendo tachada gracias a `esHoy(ultimo_riego / f_cosecha)`, y al día
  // siguiente deja de cumplir esa condición y desaparece sola, sin acumularse.
  private completedIds   = signal(new Set<number>());

  tasks = computed<GardenTask[]>(() => {
    const done = this.completedIds();
    return this.plantasService.inventario()
      .map(p => ({
        p,
        estado: calcularEstado(p),
        dias:   diasRestantes(p),
        riego:  diasHastaProximoRiego(p),
      }))
      // se muestra si hay algo pendiente (toca o va atrasado) o si se marcó hoy mismo
      // (se queda tachada el resto del día en vez de desaparecer al instante).
      .filter(({ estado, riego, p }) =>
        estado === 'ENFERMA' ||
        (estado === 'LISTA'
          ? (!p.f_cosecha || esHoy(p.f_cosecha))
          : (riego <= 0 || esHoy(p.ultimo_riego)))
      )
      .sort((a, b) => (URGENCIA[a.estado] ?? 9) - (URGENCIA[b.estado] ?? 9))
      .map(({ p, estado, dias, riego }) => {
        const tipo: GardenTask['tipo'] = estado === 'ENFERMA' ? 'ENFERMA' : estado === 'LISTA' ? 'COSECHA' : 'RIEGO';
        const completed = tipo === 'ENFERMA'
          ? done.has(p.id)
          : tipo === 'COSECHA'
            ? esHoy(p.f_cosecha) || done.has(p.id)
            : esHoy(p.ultimo_riego) || done.has(p.id);
        return {
          id:          p.id,
          tipo,
          icon:        ICONOS[estado] ?? '🌿',
          image:       p.imagen_url,
          title:       p.nombre_planta,
          description: this.descripcion(estado, dias, riego),
          completed,
        };
      });
  });

  private readonly LIMITE_TAREAS = 3;
  mostrarTodasTareas = signal(false);

  tasksVisibles = computed<GardenTask[]>(() => {
    const todas = this.tasks();
    return this.mostrarTodasTareas() ? todas : todas.slice(0, this.LIMITE_TAREAS);
  });

  toggleMostrarTodasTareas() {
    this.mostrarTodasTareas.update(v => !v);
  }

  // Una planta ya cosechada (f_cosecha marcado) deja de contar como activa en
  // el huerto: sigue en el inventario (para el historial) pero no aquí.
  private plantasActivas = computed(() =>
    this.plantasService.inventario().filter(p => !p.f_cosecha)
  );

  totalPlantas = computed(() => this.plantasActivas().length);

  plantasListas = computed(() =>
    this.plantasActivas().filter(p => calcularEstado(p) === 'LISTA').length
  );

  totalTareas = computed(() => this.tasks().length);

  tareasCompletadas = computed(() => this.tasks().filter(t => t.completed).length);

  toggleTask(task: GardenTask) {
    const marcado = !task.completed;

    // feedback visual inmediato (tachado al marcar, estado normal al desmarcar)
    this.completedIds.update(set => {
      const next = new Set(set);
      marcado ? next.add(task.id) : next.delete(task.id);
      return next;
    });

    if (task.tipo === 'ENFERMA') return; // sin persistencia todavía

    const marcar = task.tipo === 'RIEGO'
      ? this.plantasService.marcarRiego(task.id, marcado)
      : this.plantasService.marcarCosecha(task.id, marcado);

    marcar.catch(err => console.error('Error al marcar la tarea', err));

    if (task.tipo === 'COSECHA' && marcado) {
      const planta = this.plantasService.inventario().find(p => p.id === task.id);
      if (planta) this.abrirSobraCosecha(planta);
    }
  }

  // --- Intercambios: "¿te ha sobrado cosecha?" al marcar COSECHA como hecha ---

  sobraCosechaVisible = signal(false);
  sobraCosechaPlanta = signal<{ planta_id: number; nombre_planta: string } | null>(null);
  sobraCosechaCiudadInicial = signal('');
  sobraCosechaCiudades = signal<string[]>([]);
  sobraCosechaPublicando = signal(false);
  sobraCosechaError = signal('');

  private abrirSobraCosecha(planta: Planta): void {
    this.sobraCosechaPlanta.set({ planta_id: planta.planta_id, nombre_planta: planta.nombre_planta });
    this.sobraCosechaError.set('');

    const usuario = this.authService.getStoredUser();
    this.sobraCosechaCiudadInicial.set(usuario?.ciudad ?? '');
    this.sobraCosechaVisible.set(true);

    this.intercambiosService.getCiudades()
      .then(ciudades => this.sobraCosechaCiudades.set(ciudades))
      .catch(() => this.sobraCosechaCiudades.set([]));
  }

  cerrarSobraCosecha(): void {
    this.sobraCosechaVisible.set(false);
    this.sobraCosechaPlanta.set(null);
  }

  async publicarSobraCosecha(datos: SobraCosechaDatos): Promise<void> {
    const planta = this.sobraCosechaPlanta();
    const usuario = this.authService.getStoredUser();
    if (!planta || !usuario?.uid) return;

    this.sobraCosechaPublicando.set(true);
    this.sobraCosechaError.set('');
    try {
      await this.intercambiosService.crear({
        usuario_id: usuario.uid,
        nombre_usuario: usuario.nombre,
        planta_id: planta.planta_id,
        cantidad_aprox: datos.cantidad_aprox,
        ciudad: datos.ciudad,
      });

      // se recuerda la ciudad para preseleccionarla la próxima vez que se publique.
      this.authService.actualizarPerfil({
        nombre_usuario: usuario.nombre_usuario,
        tipo_dieta: usuario.tipo_dieta,
        ciudad: datos.ciudad,
      }).catch(err => console.error('Error al guardar la ciudad en el perfil', err));

      this.cerrarSobraCosecha();
    } catch (err) {
      const status = (err as { status?: number })?.status;
      if (status === 409) {
        // ya tenía un excedente activo publicado para esta planta: no es un error del usuario
        this.cerrarSobraCosecha();
      } else {
        console.error('Error al publicar excedente de cosecha', err);
        this.sobraCosechaError.set('No se ha podido publicar. Inténtalo de nuevo.');
      }
    } finally {
      this.sobraCosechaPublicando.set(false);
    }
  }

  private descripcion(estado: string, dias: number, riego: number): string {
    switch (estado) {
      case 'LISTA': {
        if (dias >= 0) return 'Lista para cosechar hoy';
        const atraso = -dias;
        return `Cosecha atrasada ${atraso} día${atraso === 1 ? '' : 's'}`;
      }
      case 'CRECIENDO':
      case 'PLANTADA': {
        const cosecha = dias > 0
          ? `Lista en ${dias} día${dias === 1 ? '' : 's'}`
          : 'Revisa si está lista';
        if (riego < 0) {
          const atraso = -riego;
          return `Riego atrasado ${atraso} día${atraso === 1 ? '' : 's'} · ${cosecha}`;
        }
        return `Riega hoy · ${cosecha}`;
      }
      case 'ENFERMA':   return 'Necesita atención urgente';
      default:          return 'Revisar estado';
    }
  }
}
