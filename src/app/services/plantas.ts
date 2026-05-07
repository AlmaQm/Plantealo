import { Injectable, signal } from '@angular/core';
import { Planta } from '../models/interfaces';
import { PLANTAS_DATA } from '../data/plantas.data';

@Injectable({
  providedIn: 'root'
})
export class PlantasService {

  private plantasSignal = signal<Planta[]>(PLANTAS_DATA);

  readonly plantas = this.plantasSignal.asReadonly();
}
