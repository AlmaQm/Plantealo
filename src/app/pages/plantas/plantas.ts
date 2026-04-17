import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { PlantasService } from '../../services/plantas';

@Component({
  selector: 'app-plantas',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './plantas.html',
  styleUrls: ['./plantas.scss']
})
export class PlantasComponent {

  private plantasService = inject(PlantasService);

  plantas = this.plantasService.plantas;
}