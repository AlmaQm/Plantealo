import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { IonicModule, ModalController } from '@ionic/angular'; // 👈 Importante
import { Receta } from '../../../models/interfaces';

@Component({
  selector: 'app-receta-window',
  standalone: true,
  imports: [
    CommonModule, 
    IonicModule // 👈 Esto quita el rojo de los <ion-header>, <ion-list>, etc.
  ], 
  templateUrl: './receta-window.html',
  styleUrls: ['./receta-window.scss']
})
export class RecetaWindowComponent {
  // Los inputs que recibe desde el openRecipe()
  @Input() receta!: Receta;
  @Input() disponibles: any[] = [];
  @Input() necesarios: any[] = [];
  @Input() compatibilidad!: number;

  constructor(private modalCtrl: ModalController) {}

  cerrar() {
    this.modalCtrl.dismiss();
  }
}