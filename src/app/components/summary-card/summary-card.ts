import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-summary-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './summary-card.html',
  styleUrls: ['./summary-card.scss']
})
export class SummaryCardComponent {
  // Valores por defecto basados en tu imagen
  @Input() harvestReady: number = 2;
  @Input() totalPlants: number = 8;
  @Input() tasksCompleted: number = 0;
  @Input() totalTasks: number = 5;

  get harvestPercentage(): number {
    return (this.harvestReady / this.totalPlants) * 100;
  }

  get tasksPercentage(): number {
    return (this.tasksCompleted / this.totalTasks) * 100;
  }
}