import { Component, Input } from '@angular/core';
import { Receta } from '../../../models/interfaces';

@Component({
  selector: 'app-receta-card',
  standalone: true,
  templateUrl: './receta-card.html',
  styleUrls: ['./receta-card.scss']
})
export class RecetaCardComponent {

  @Input() receta!: Receta;
  @Input() compatibilidad!: number;

}