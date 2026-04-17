import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GardenTask } from '../../models/interfaces';

// Tus componentes importados
import { WeatherCardComponent } from '../../components/weather-card/weather-card';
import { CalendarWeekComponent } from '../../components/calendar-week/calendar-week';
import { TaskItemComponent } from '../../components/task-item/task-item';
import { SummaryCardComponent } from '../../components/summary-card/summary-card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    WeatherCardComponent,
    CalendarWeekComponent,
    TaskItemComponent,
    SummaryCardComponent,
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent {
  tasks: GardenTask[] = [
    { id: 1, icon: '🍅', title: 'Tomates Cherry', description: 'Listos para cosechar', completed: false },
    { id: 2, icon: '🌿', title: 'Albahaca', description: 'Regar por la mañana', completed: false }
  ];
}