

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

import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, timer } from 'rxjs';
import { shareReplay, catchError, retry } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
   LucideIcon,
   LucideSun,
   LucideCloudSun,
   LucideCloud,
   LucideCloudRain,
   LucideCloudLightning,
   LucideSnowflake,
} from '@lucide/angular';

@Injectable({
   providedIn: 'root'
})
export class WeatherService {

   private weatherData$?: Observable<any[]>;
   weatherError = signal<string | null>(null);

   // referencias para que las plantillas sepan cuándo pintar el sol en amarillo
   // y la lluvia/tormenta en gris, dejando el resto (nublado, nieve) en azul
   readonly iconoSol = LucideSun;
   private readonly iconoLluvia = LucideCloudRain;
   private readonly iconoTormenta = LucideCloudLightning;

   esLluvia(icon: LucideIcon | null): boolean {
      return icon === this.iconoLluvia || icon === this.iconoTormenta;
   }

   constructor(private http: HttpClient) { }

   getWeatherData(): Observable<any[]> {

      if (this.weatherData$) {
         return this.weatherData$;
      }

      const url = `${environment.apiUrl}/tiempo`;

      this.weatherData$ = this.http.get<any[]>(url).pipe(

         // nuestro backend ya cachea y hace de intermediario con AEMET;
         // aun asi reintentamos por si hay un fallo puntual de red.
         retry({ count: 2, delay: (_err, retryCount) => timer(retryCount * 1000) }),

         shareReplay(1),

         catchError(err => {
            console.error('ERROR AEMET:', err);
            this.weatherError.set('No se ha podido cargar el tiempo ahora mismo. Inténtalo de nuevo en unos minutos.');
            return of([]);
         })

      );

      return this.weatherData$;
   }

   getIconoDia(dia: any): LucideIcon | null {
      const value = dia?.estadoCielo?.find((c: any) => c.value)?.value ?? '';
      return this.getIconoClimaPorCodigo(value);
   }

   getDescripcionDia(dia: any): string {
      return dia?.estadoCielo?.find((c: any) => c.descripcion)?.descripcion ?? '';
   }

   // Códigos oficiales AEMET: https://www.aemet.es/es/eltiempo/prediccion/municipios/ayuda
   // Los códigos nocturnos llevan sufijo 'n' (ej: "11n"), se eliminan antes de parsear
   getIconoClimaPorCodigo(value: string): LucideIcon | null {
      if (!value) return null;
      const code = parseInt(value.replace('n', ''), 10);
      if (isNaN(code)) return null;

      if (code === 11) return LucideSun;
      if ([12, 13, 17].includes(code)) return LucideCloudSun;
      if ([14, 15, 16].includes(code)) return LucideCloud;
      if ([23, 24, 25, 26, 43, 44, 45, 46].includes(code)) return LucideCloudRain;
      if ([51, 52, 53, 54, 61, 62, 63, 64, 71, 72, 73, 74].includes(code)) return LucideCloudLightning;
      if ([33, 34, 35, 36].includes(code)) return LucideSnowflake;

      return null;
   }

   getPrecipitacion(dia: any): number {
      const periodos: any[] = dia?.probPrecipitacion ?? [];
      const diaCompleto = periodos.find((p: any) => p.periodo === '00-24');
      if (diaCompleto?.value !== undefined && diaCompleto.value !== '') {
         return Number(diaCompleto.value);
      }
      const valores = periodos.map((p: any) => Number(p.value)).filter(v => !isNaN(v));
      return valores.length ? Math.max(...valores) : 0;
   }

   // 🌱 DECISIÓN DE RIEGO (PRECIPITACIÓN + TEMPERATURA)
   isGoodDayToWater(tempMax: number, precipitation: number): boolean {

      if (precipitation > 40) return false;

      if (tempMax > 35) return false;

      return true;
   }
}