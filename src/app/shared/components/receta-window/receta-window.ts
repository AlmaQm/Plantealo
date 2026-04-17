import { Component, Input } from '@angular/core';
import { Receta } from '../../../models/interfaces';

@Component({
  selector: 'app-receta-window',
  standalone: true,
  templateUrl: './receta-window.html',
  styleUrls: ['./receta-window.scss']
})
export class RecetaWindowComponent {

  @Input() receta!: Receta;
  @Input() disponibles: any[] = [];
  @Input() necesarios: any[] = [];
  @Input() compatibilidad!: number;

}