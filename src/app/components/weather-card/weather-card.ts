import { Component, OnInit } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { WeatherService } from '../../services/weather.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-weather-card',
  standalone: true,
  imports: [CommonModule, AsyncPipe],
  templateUrl: './weather-card.html',
  styleUrls: ['./weather-card.scss']
})
export class WeatherCardComponent implements OnInit {
  weather$!: Observable<any>;

  constructor(private weatherService: WeatherService) { }

  ngOnInit() {
    this.weather$ = this.weatherService.getWeatherData();
  }
}