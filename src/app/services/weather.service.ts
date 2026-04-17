import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { switchMap } from 'rxjs/operators';

@Injectable({
   providedIn: 'root'
})
export class WeatherService {

   // 🔑 TU TOKEN (el del correo)
   private apiKey = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJiZXJ0YWdyYW5kaWFAZ21haWwuY29tIiwianRpIjoiOTZkZWEyYTktOTRiZS00YmY2LWIwYjctNzkzNjg2MzY2MmQ4IiwiaXNzIjoiQUVNRVQiLCJpYXQiOjE3NzY0MjQ0MTUsInVzZXJJZCI6Ijk2ZGVhMmE5LTk0YmUtNGJmNi1iMGI3LTc5MzY4NjM2NjJkOCIsInJvbGUiOiIifQ.0FcG8g5vxzzFku5umCbCy-CkynADitphTkxO-7YlY9c';

   constructor(private http: HttpClient) { }

   getWeatherData() {

      // 📍 Endpoint AEMET (Barcelona)
      const url =
         '/aemet/opendata/api/prediccion/especifica/municipio/diaria/08019';
      // 🔥 1ª llamada (con Authorization)
      return this.http.get<any>(url, {
         headers: {
            Authorization: `Bearer ${this.apiKey}`
         }
      }).pipe(

         // 🔥 2ª llamada (AEMET siempre devuelve "datos")
         switchMap(res => this.http.get(res.datos))
      );
   }
}