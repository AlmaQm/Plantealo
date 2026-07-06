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
import { LucideDynamicIcon, LucideSnowflake, LucideCloudRain, LucideSprout, LucideBan } from '@lucide/angular';

@Component({
  selector: 'app-weather-card',
  standalone: true,
  imports: [CommonModule, AsyncPipe, LucideDynamicIcon, LucideSnowflake, LucideCloudRain, LucideSprout, LucideBan],
  templateUrl: './weather-card.html',
  styleUrls: ['./weather-card.scss']
})
export class WeatherCardComponent implements OnInit {

  weather$!: Observable<any[]>;
  currentDay = 0;
  private touchStartX = 0;
  private touchStartY = 0;

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

  goToDay(index: number) {
    this.currentDay = index;
  }

  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.touches[0].clientX;
    this.touchStartY = event.touches[0].clientY;
  }

  onTouchMove(_event: TouchEvent) {}

  onTouchEnd(event: TouchEvent, total: number) {
    const deltaX = event.changedTouches[0].clientX - this.touchStartX;
    const deltaY = event.changedTouches[0].clientY - this.touchStartY;
    if (Math.abs(deltaX) < 40) return;
    if (Math.abs(deltaY) > Math.abs(deltaX)) return;
    if (deltaX < 0) this.nextDay(total);
    else this.prevDay();
  }

  getDayName(fecha: string): string {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return days[new Date(fecha).getDay()];
  }
}