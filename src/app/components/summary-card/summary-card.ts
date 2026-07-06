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
  @Input() harvestReady: number = 0;
  @Input() totalPlants: number = 0;
  @Input() tasksCompleted: number = 0;
  @Input() totalTasks: number = 0;

  get harvestPercentage(): number {
    return this.totalPlants > 0 ? (this.harvestReady / this.totalPlants) * 100 : 0;
  }

  get tasksPercentage(): number {
    return this.totalTasks > 0 ? (this.tasksCompleted / this.totalTasks) * 100 : 0;
  }
}