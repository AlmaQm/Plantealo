import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
   providedIn: 'root'
})
export class WeatherService {

   // He usado tu clave, pero recuerda regenerarla luego por seguridad
   private apiKey = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJiZXJ0YWdyYW5kaWFAZ21haWwuY29tIiwianRpIjoiOTZkZWEyYTktOTRiZS00YmY2LWIwYjctNzkzNjg2MzY2MmQ4IiwiaXNzIjoiQUVNRVQiLCJpYXQiOjE3NzY0MjQ0MTUsInVzZXJJZCI6Ijk2ZGVhMmE5LTk0YmUtNGJmNi1iMGI3LTc5MzY4NjM2NjJkOCIsInJvbGUiOiIifQ.0FcG8g5vxzzFku5umCbCy-CkynADitphTkxO-7YlY9c';

   constructor(private http: HttpClient) { }

   getWeatherData(): Observable<any> {
      // 1. Usamos el prefijo del proxy /api-aemet
      // 2. Pasamos la api_key en la URL como pide AEMET
      const url = `/api-aemet/opendata/api/prediccion/especifica/municipio/diaria/08019?api_key=${this.apiKey}`;

      return this.http.get<any>(url).pipe(
         switchMap(res => {
            // AEMET devuelve un JSON con una URL en la propiedad 'datos'
            // Esta segunda URL contiene el pronóstico real
            return this.http.get(res.datos);
         })
      );
   }

   // En tu componente .ts
   getIconoClima(descripcion: string): string {
      const desc = descripcion.toLowerCase();
      if (desc.includes('despejado')) return '☀️';
      if (desc.includes('nubes')) return '☁️';
      if (desc.includes('lluvia') || desc.includes('llovizna')) return '🌧️';
      if (desc.includes('tormenta')) return '⛈️';
      if (desc.includes('nieve')) return '❄️';
      return '🌡️'; // Por defecto
   }
}