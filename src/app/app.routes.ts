import { Routes } from '@angular/router';


export const routes: Routes = [
  {
    path: '',
    redirectTo: 'inicio',
    pathMatch: 'full'
  },
  {
    path: 'inicio',
    loadComponent: () =>
      import('./pages/home/home').then(m => m.Home)
  },
  {
    path: 'plantas',
    loadComponent: () =>
      import('./pages/plantas/plantas').then(m => m.PlantasComponent)
  },
  {
    path: 'recetas',
    loadComponent: () =>
      import('./pages/recetas/recetas').then(m => m.RecetasComponent)
  },
  {
    path: 'comunidad',
    loadComponent: () =>
      import('./pages/comunidad/comunidad').then(m => m.Comunidad)
  },
  {
    path: 'perfil',
    loadComponent: () =>
      import('./pages/perfil/perfil').then(m => m.Perfil)
  }
];