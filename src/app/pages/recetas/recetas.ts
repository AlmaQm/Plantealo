import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { RecetaCardComponent } from '../../shared/components/receta-card/receta-card';

@Component({
  selector: 'app-recetas',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    RecetaCardComponent
  ],
  templateUrl: './recetas.html',
  styleUrls: ['./recetas.scss']
})
export class RecetasComponent {

  recipes: any[] = [];

  openRecipe(receta: any) {
    console.log('open', receta);
  }
}