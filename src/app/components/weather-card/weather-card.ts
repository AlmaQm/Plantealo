// import { Component, OnInit } from '@angular/core';
// import { CommonModule, AsyncPipe } from '@angular/common';
// import { Observable } from 'rxjs';
// import { WeatherService } from '../../services/weather.service';

// @Component({
//   selector: 'app-weather-card',
//   standalone: true,
//   imports: [CommonModule, AsyncPipe],
//   templateUrl: './weather-card.html',
//   styleUrls: ['./weather-card.scss']
// })
// export class WeatherCardComponent implements OnInit {

//   weather$!: Observable<any[]>;
//   currentDay = 0;

//   constructor(public weatherService: WeatherService) { }

//   ngOnInit(): void {
//     this.weather$ = this.weatherService.getWeatherData();
//   }

//   nextDay(total: number) {
//     if (this.currentDay < total - 1) this.currentDay++;
//   }

//   prevDay() {
//     if (this.currentDay > 0) this.currentDay--;
//   }
// }

import { Component, OnInit } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { WeatherService } from '../../services/weather.service';

@Component({
  selector: 'app-weather-card',
  standalone: true,
  imports: [CommonModule, AsyncPipe],
  templateUrl: './weather-card.html',
  styleUrls: ['./weather-card.scss']
})
export class WeatherCardComponent implements OnInit {

  weather$!: Observable<any[]>;
  currentDay = 0;

  constructor(public weatherService: WeatherService) { }

  ngOnInit(): void {
    this.weather$ = this.weatherService.getWeatherData();
  }

  nextDay(total: number) {
    if (this.currentDay < total - 1) this.currentDay++;
  }

  prevDay() {
    if (this.currentDay > 0) this.currentDay--;
  }
}