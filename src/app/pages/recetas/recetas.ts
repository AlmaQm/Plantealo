import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { RecipesService } from '../../services/recipes'; // 👈 Revisa que el nombre del archivo sea correcto
import { RecetaCardComponent } from '../../shared/components/receta-card/receta-card';
import { RecetaWindowComponent } from '../../shared/components/receta-window/receta-window';
import { Receta } from '../../models/interfaces';

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
export class RecetasComponent implements OnInit {
  
  recipes: any[] = [];
  
  // Estos son los ingredientes que compararemos con la API (en inglés para MealDB)
  misPlantasDelHuerto = ['Tomato', 'Basil', 'Lettuce', 'Onion', 'Garlic', 'Potato']; 

  constructor(
    private recipesService: RecipesService,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.cargarRecetas();
  }

  cargarRecetas() {
    // Usamos el servicio que ya mapea 'titulo' e 'imagen'
    this.recipesService.getRecetasPorDieta('vegetariana').subscribe({
      next: (data) => {
        console.log('Recetas cargadas con éxito:', data);
        this.recipes = data;
      },
      error: (err) => {
        console.error('Error al conectar con la API de recetas:', err);
      }
    });
  }

  async openRecipe(recetaSimple: any) {
    // 1. Obtenemos el detalle completo de la receta pulsada
    // Usamos el id que viene de la API (mapeado en el servicio)
    const idBusqueda = recetaSimple.id; 

    this.recipesService.getDetalleReceta(idBusqueda).subscribe({
      next: async (recetaCompleta: Receta) => {
        
        // 2. Lógica de comparación con el huerto
        const disponibles = recetaCompleta.ingredientes.filter(ing => 
          this.misPlantasDelHuerto.some(planta => 
            ing.nombre.toLowerCase().includes(planta.toLowerCase())
          )
        );

        const necesarios = recetaCompleta.ingredientes.filter(ing => 
          !disponibles.some(d => d.nombre === ing.nombre)
        );

        const porcentaje = Math.round((disponibles.length / recetaCompleta.ingredientes.length) * 100);

        // 3. Abrir el modal con los datos procesados
        const modal = await this.modalCtrl.create({
          component: RecetaWindowComponent,
          componentProps: {
            receta: recetaCompleta,
            disponibles: disponibles,
            necesarios: necesarios,
            compatibilidad: porcentaje
          }
        });
        
        await modal.present();
      },
      error: (err) => console.error('Error al cargar detalle:', err)
    });
  }
}