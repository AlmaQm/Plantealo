import { Component } from '@angular/core';

@Component({
  selector: 'app-summary-card',
  standalone: true,
  templateUrl: './summary-card.html'
})
export class SummaryCardComponent {
  readyCount: number = 2; // O usa Signals
  total: number = 8;
  percent: number = 25;
}