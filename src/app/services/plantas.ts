import { Injectable, signal } from '@angular/core';
import { Planta } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class PlantasService {

  private plantasSignal = signal<Planta[]>([]);

  readonly plantas = this.plantasSignal.asReadonly();

  constructor() {
    this.loadMockData();
  }

  private loadMockData() {
    this.plantasSignal.set([
      {
        nombre: 'Tomate Cherry',
        fecha_inicio: new Date(),
        fecha_siembra: new Date(),
        clima_ideal: 'Cálido',
        imagen: 'assets/tomate.jpg',
        estado: 'creciendo',
        tipo: 'exterior',
        notificaciones: true
      }
    ]);
  }
}