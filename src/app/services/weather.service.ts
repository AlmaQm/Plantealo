

// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable, of } from 'rxjs';
// import { switchMap, shareReplay, catchError } from 'rxjs/operators';

// @Injectable({
//    providedIn: 'root'
// })
// export class WeatherService {

//    private apiKey = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJiZXJ0YWdyYW5kaWFAZ21haWwuY29tIiwianRpIjoiOTZkZWEyYTktOTRiZS00YmY2LWIwYjctNzkzNjg2MzY2MmQ4IiwiaXNzIjoiQUVNRVQiLCJpYXQiOjE3NzY0MjQ0MTUsInVzZXJJZCI6Ijk2ZGVhMmE5LTk0YmUtNGJmNi1iMGI3LTc5MzY4NjM2NjJkOCIsInJvbGUiOiIifQ.0FcG8g5vxzzFku5umCbCy-CkynADitphTkxO-7YlY9c';

//    private weatherData$?: Observable<any[]>;

//    constructor(private http: HttpClient) { }

//    getWeatherData(): Observable<any[]> {

//       if (this.weatherData$) {
//          return this.weatherData$;
//       }

//       const url =
//          `/api-aemet/opendata/api/prediccion/especifica/municipio/diaria/08019?api_key=${this.apiKey}`;

//       this.weatherData$ = this.http.get<any>(url).pipe(

//          switchMap(res => this.http.get<any[]>(res.datos)),

//          shareReplay(1),

//          catchError(err => {
//             console.error('ERROR AEMET:', err);
//             return of([]);
//          })

//       );

//       return this.weatherData$;
//    }

//    // 🌤️ ICONOS CORRECTOS POR CÓDIGO AEMET
//    getIconoClimaPorCodigo(value: string): string {

//       if (!value) return '';

//       const code = Number(value);

//       // ☀️ Sol
//       if ([0, 1].includes(code)) return '☀️';

//       // 🌤️ Poco nuboso
//       if ([2, 3].includes(code)) return '🌤️';

//       // ☁️ Nuboso
//       if ([4, 5, 6].includes(code)) return '☁️';

//       // 🌧️ Lluvia
//       if ([7, 8, 9, 10, 11, 13].includes(code)) return '🌧️';

//       // ⛈️ Tormenta
//       if ([14, 15, 16].includes(code)) return '⛈️';

//       // ❄️ Nieve
//       if ([20, 21, 22, 23, 24].includes(code)) return '❄️';

//       return '';
//    }

//    isGoodDayToWater(tempMax: number, humidity: number, precipitation: number): boolean {

//       // Reglas simples pero efectivas:
//       // - No regar si va a llover
//       // - No regar si humedad alta
//       // - Mejor si temperatura moderada

//       if (precipitation > 40) return false;

//       if (humidity > 75) return false;

//       if (tempMax > 35) return false; // calor extremo no es ideal

//       return true;
//    }
// }

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { switchMap, shareReplay, catchError } from 'rxjs/operators';

@Injectable({
   providedIn: 'root'
})
export class WeatherService {

   private apiKey = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJiZXJ0YWdyYW5kaWFAZ21haWwuY29tIiwianRpIjoiOTZkZWEyYTktOTRiZS00YmY2LWIwYjctNzkzNjg2MzY2MmQ4IiwiaXNzIjoiQUVNRVQiLCJpYXQiOjE3NzY0MjQ0MTUsInVzZXJJZCI6Ijk2ZGVhMmE5LTk0YmUtNGJmNi1iMGI3LTc5MzY4NjM2NjJkOCIsInJvbGUiOiIifQ.0FcG8g5vxzzFku5umCbCy-CkynADitphTkxO-7YlY9c';

   private weatherData$?: Observable<any[]>;

   constructor(private http: HttpClient) { }

   getWeatherData(): Observable<any[]> {

      if (this.weatherData$) {
         return this.weatherData$;
      }

      const url =
         `/api-aemet/opendata/api/prediccion/especifica/municipio/diaria/08019?api_key=${this.apiKey}`;

      this.weatherData$ = this.http.get<any>(url).pipe(

         switchMap(res => this.http.get<any[]>(res.datos)),

         shareReplay(1),

         catchError(err => {
            console.error('ERROR AEMET:', err);
            return of([]);
         })

      );

      return this.weatherData$;
   }

   // 🌤️ ICONOS
   getIconoClimaPorCodigo(value: string): string {

      if (!value) return '';

      const code = Number(value);

      if ([0, 1].includes(code)) return '☀️';
      if ([2, 3].includes(code)) return '🌤️';
      if ([4, 5, 6].includes(code)) return '☁️';
      if ([7, 8, 9, 10, 11, 13].includes(code)) return '🌧️';
      if ([14, 15, 16].includes(code)) return '⛈️';
      if ([20, 21, 22, 23, 24].includes(code)) return '❄️';

      return '';
   }

   // 🌱 DECISIÓN DE RIEGO (PRECIPITACIÓN + TEMPERATURA)
   isGoodDayToWater(tempMax: number, precipitation: number): boolean {

      if (precipitation > 40) return false;

      if (tempMax > 35) return false;

      return true;
   }
}