import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PlantasService, calcularEstado, diasRestantes } from '../../services/plantas';
import { GardenTask } from '../../models/interfaces';

import { WeatherCardComponent } from '../../components/weather-card/weather-card';
import { CalendarWeekComponent } from '../../components/calendar-week/calendar-week';
import { TaskItemComponent } from '../../components/task-item/task-item';
import { SummaryCardComponent } from '../../components/summary-card/summary-card';
import { DietRecommendationsComponent } from '../../components/diet-recommendations/diet-recommendations';

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
    RouterLink,
    WeatherCardComponent,
    CalendarWeekComponent,
    TaskItemComponent,
    SummaryCardComponent,
    DietRecommendationsComponent,
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent {
  private plantasService = inject(PlantasService);
  private completedIds   = signal(new Set<number>());

  tasks = computed<GardenTask[]>(() => {
    const done = this.completedIds();
    return this.plantasService.inventario()
      .map(p => {
        const estado = calcularEstado(p);
        const dias   = diasRestantes(p);
        return {
          id:          p.planta_id,
          icon:        ICONOS[estado] ?? '🌿',
          image:       p.imagen_url,
          title:       p.nombre_planta,
          description: this.descripcion(estado, dias),
          completed:   done.has(p.planta_id),
        };
      })
      .sort((a, b) => {
        const ua = URGENCIA[this.estadoDesdeTitulo(a)] ?? 9;
        const ub = URGENCIA[this.estadoDesdeTitulo(b)] ?? 9;
        return ua - ub;
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

  toggleTask(task: GardenTask) {
    this.completedIds.update(set => {
      const next = new Set(set);
      next.has(task.id) ? next.delete(task.id) : next.add(task.id);
      return next;
    });
  }

  private descripcion(estado: string, dias: number): string {
    switch (estado) {
      case 'LISTA':     return dias < 0
                          ? `Lista para cosechar — no esperes más`
                          : `Lista para cosechar hoy`;
      case 'CRECIENDO': return dias > 0
                          ? `Lista en ${dias} día${dias === 1 ? '' : 's'}`
                          : 'Revisa si está lista';
      case 'PLANTADA':  return 'Germinando — vigila la humedad';
      case 'ENFERMA':   return 'Necesita atención urgente';
      default:          return 'Revisar estado';
    }
  }

  // helper para re-ordenar después de mapear (el estado ya no está en GardenTask)
  private estadoDesdeTitulo(task: GardenTask): string {
    if (task.icon === '⚠️') return 'ENFERMA';
    if (task.icon === '🌾') return 'LISTA';
    if (task.icon === '💧') return 'CRECIENDO';
    return 'PLANTADA';
  }
}
