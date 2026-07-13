import { Injectable, signal } from '@angular/core';
import { Planta } from '../models/interfaces';
// import { PLANTAS_DATA } from '../data/planta'; // deshabilitado: el archivo no tiene exports (TS2306)
const PLANTAS_DATA: Planta[] = [];

@Injectable({
  providedIn: 'root'
})
export class PlantasService {

  readonly catalogo: Planta[] = PLANTAS_DATA;

  private inventarioSignal = signal<Planta[]>([]);
  readonly inventario = this.inventarioSignal.asReadonly();

  addPlanta(planta: Planta): void {
    this.inventarioSignal.update(current => [...current, planta]);
  }
}
