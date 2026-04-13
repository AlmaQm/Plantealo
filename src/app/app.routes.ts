import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'recetas',
    loadComponent: () =>
      import('./pages/recetas/recetas').then(m => m.RecetasComponent)
  }
];