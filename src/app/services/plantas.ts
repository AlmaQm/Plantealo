import { Injectable, signal } from '@angular/core';
import { Planta } from '../models/interfaces';
import { PLANTAS_DATA } from '../data/plantas.data';

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
