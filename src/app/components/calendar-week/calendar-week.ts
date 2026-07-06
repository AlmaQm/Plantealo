import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherService } from '../../services/weather.service';
import { LucideIcon, LucideDynamicIcon } from '@lucide/angular';

interface Day {
  name: string;
  date: number;
  fullDate: Date;
  isToday: boolean;
  icon: LucideIcon | null;
  tempMax: number | null;
}

@Component({
  selector: 'app-calendar-week',
  standalone: true,
  imports: [CommonModule, LucideDynamicIcon],
  templateUrl: './calendar-week.html',
  styleUrls: ['./calendar-week.scss']
})
export class CalendarWeekComponent implements OnInit {
  week: Day[] = [];

  constructor(public weatherService: WeatherService) {}

  ngOnInit() {
    this.generateWeek();
    const hoy = new Date();
    this.weatherService.getWeatherData().subscribe(data => {
      const dias = data?.[0]?.prediccion?.dia ?? [];
      this.week = this.week.map(day => {
        // AEMET solo da previsión desde hoy en adelante: para un día ya pasado de esta
        // semana (p. ej. lunes si hoy es viernes), mostramos la previsión del mismo día
        // de la semana siguiente en lugar de dejarlo vacío.
        const yaPaso = !day.isToday && day.fullDate < hoy;
        const fechaBusqueda = yaPaso ? this.addDays(day.fullDate, 7) : day.fullDate;

        const match = dias.find((d: any) => {
          const aemetDate = new Date(d.fecha);
          return aemetDate.toDateString() === fechaBusqueda.toDateString();
        });
        const cieloValue = match?.estadoCielo?.find((c: any) => c.value)?.value ?? '';
        return {
          ...day,
          icon: this.weatherService.getIconoClimaPorCodigo(cieloValue),
          tempMax: match ? match.temperatura?.maxima ?? null : null
        };
      });
    });
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  generateWeek() {
    const today = new Date();
    const startOfWeek = new Date(today);
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      this.week.push({
        name: date.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', ''),
        date: date.getDate(),
        fullDate: date,
        isToday: date.toDateString() === today.toDateString(),
        icon: null,
        tempMax: null
      });
    }
  }
}