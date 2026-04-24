import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular'; // 👈 Añade esto
import { Receta } from '../../../models/interfaces';

@Component({
  selector: 'app-receta-card',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule // 👈 Esto permite usar <ion-progress-bar> en la card
  ],
  templateUrl: './receta-card.html',
  styleUrls: ['./receta-card.scss']
})
export class RecetaCardComponent {
  @Input() receta!: any; // Usamos any porque TheMealDB viene con nombres de campos distintos al principio
  @Input() compatibilidad: number = 0;
}