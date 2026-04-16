import { Injectable, signal } from '@angular/core';
import { Planta } from '../models/interfaces';

@Injectable({
  providedIn: 'root',
})
export class PlantasService { // Recomendado añadir "Service" al nombre

  // Usamos el tipo Planta[] en lugar de any para tener autocompletado
  private plantasSignal = signal<Planta[]>([]);
  
  // Exponemos la signal de solo lectura para los componentes
  public readonly plantas = this.plantasSignal.asReadonly();

  constructor() {
    this.loadMockData(); // Llamamos a una función inicial
  }

  private loadMockData() {
    const mock: Planta[] = [
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
    ];
    this.plantasSignal.set(mock);
  }

  // Aquí irán vuestros métodos CRUD (add, delete, update)
}