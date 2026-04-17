import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Day {
  name: string; // Ej: 'Lun'
  date: number; // Ej: 23
  isToday: boolean;
}

@Component({
  selector: 'app-calendar-week',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar-week.html',
  styleUrls: ['./calendar-week.scss']
})
export class CalendarWeekComponent implements OnInit {
  week: Day[] = [];

  ngOnInit() {
    this.generateWeek();
  }

  generateWeek() {
    const today = new Date();
    const startOfWeek = new Date(today);

    // Ajustar al lunes de la semana actual
    const dayOfWeek = today.getDay(); // 0 (Dom) a 6 (Sáb)
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);

      this.week.push({
        name: date.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', ''),
        date: date.getDate(),
        isToday: date.toDateString() === today.toDateString()
      });
    }
  }
}