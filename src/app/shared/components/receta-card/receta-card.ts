import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-receta-card',
  standalone: true,
  templateUrl: './receta-card.html',
  styleUrls: ['./receta-card.scss']
})
export class RecetaCardComponent {

  @Input() title!: string;
  @Input() image!: string;
}