import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { Intercambio } from '../models/interfaces';
import { getImagenPlanta } from './plantas';

interface ApiIntercambio {
  id: number;
  usuario_id: string;
  nombre_usuario: string;
  planta_id: number;
  nombre_planta: string;
  imagen_url: string | null;
  cantidad_aprox: string | null;
  ciudad: string;
  estado: string;
  fecha_creacion: string;
}

@Injectable({ providedIn: 'root' })
export class IntercambiosService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/intercambios`;

  private mapIntercambio(d: ApiIntercambio): Intercambio {
    return {
      id: d.id,
      usuario_id: d.usuario_id,
      nombre_usuario: d.nombre_usuario,
      planta_id: d.planta_id,
      nombre_planta: d.nombre_planta,
      imagen_url: getImagenPlanta(d.nombre_planta),
      cantidad_aprox: d.cantidad_aprox,
      ciudad: d.ciudad,
      fecha_creacion: new Date(d.fecha_creacion),
    };
  }

  async listar(filtros: { ciudad?: string; planta_id?: number } = {}): Promise<Intercambio[]> {
    const params: Record<string, string> = {};
    if (filtros.ciudad) params['ciudad'] = filtros.ciudad;
    if (filtros.planta_id) params['planta_id'] = String(filtros.planta_id);
    const docs = await firstValueFrom(this.http.get<ApiIntercambio[]>(this.apiUrl + '/', { params }));
    return docs.map(d => this.mapIntercambio(d));
  }

  async crear(data: {
    usuario_id: string;
    nombre_usuario: string;
    planta_id: number;
    cantidad_aprox?: string;
    ciudad: string;
  }): Promise<Intercambio> {
    const creado = await firstValueFrom(this.http.post<ApiIntercambio>(this.apiUrl + '/', data));
    return this.mapIntercambio(creado);
  }

  async cerrar(id: number, usuarioId: string): Promise<void> {
    await firstValueFrom(
      this.http.patch(`${this.apiUrl}/${id}/cerrar`, { usuario_id: usuarioId })
    );
  }

  async getCiudades(): Promise<string[]> {
    return firstValueFrom(this.http.get<string[]>(`${environment.apiUrl}/ciudades/`));
  }
}
