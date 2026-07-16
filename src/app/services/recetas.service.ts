import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  RecetaBase,
  RecetaHuerto,
  RecetaCreate,
  ConsultaHuertoRequest,
  ClasificacionRecetasResponse,
} from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class RecetasService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getPlantasUsuarioIds(usuarioId: number): Observable<number[]> {
    return this.http.get<number[]>(`${this.baseUrl}/usuarios/${usuarioId}/plantas/ids`);
  }

  getFeed(idsPlantas: number[], usuarioId?: number): Observable<RecetaHuerto[]> {
    const body: ConsultaHuertoRequest = { ids_plantas: idsPlantas, usuario_id: usuarioId };
    return this.http.post<RecetaHuerto[]>(`${this.baseUrl}/recetas/feed`, body);
  }

  buscarPorHuerto(idsPlantas: number[], usuarioId?: number): Observable<ClasificacionRecetasResponse> {
    const body: ConsultaHuertoRequest = { ids_plantas: idsPlantas, usuario_id: usuarioId };
    return this.http.post<ClasificacionRecetasResponse>(`${this.baseUrl}/recetas/buscar-por-huerto`, body);
  }

  guardarReceta(usuarioId: number, recetaId: number): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/usuarios/${usuarioId}/recetas-guardadas/${recetaId}`, null);
  }

  desguardarReceta(usuarioId: number, recetaId: number): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/usuarios/${usuarioId}/recetas-guardadas/${recetaId}`);
  }

  getRecetasGuardadas(usuarioId: number): Observable<RecetaBase[]> {
    return this.http.get<RecetaBase[]>(`${this.baseUrl}/usuarios/${usuarioId}/recetas-guardadas`);
  }

  crearReceta(receta: RecetaCreate, usuarioId: number): Observable<RecetaBase> {
    return this.http.post<RecetaBase>(`${this.baseUrl}/recetas?usuario_id=${usuarioId}`, receta);
  }
}
