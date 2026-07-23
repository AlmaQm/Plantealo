import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.Login),
    canActivate: [guestGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register').then(m => m.Register),
    canActivate: [guestGuard]
  },
  {
    path: 'inicio',
    loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent),
    canActivate: [authGuard]
  },
  {
    path: 'plantas',
    loadComponent: () => import('./pages/plantas/plantas').then(m => m.PlantasComponent),
    canActivate: [authGuard]
  },
  {
    path: 'recetas',
    loadComponent: () => import('./pages/recetas/recetas').then(m => m.RecetasComponent),
    canActivate: [authGuard]
  },
  {
    path: 'comunidad',
    loadComponent: () => import('./pages/comunidad/comunidad').then(m => m.Comunidad),
    canActivate: [authGuard]
  },
  {
    path: 'perfil',
    loadComponent: () => import('./pages/perfil/perfil').then(m => m.PerfilComponent),
    canActivate: [authGuard]
  },
  {
    path: 'plantas-historial',
    loadComponent: () => import('./pages/plantas-historial/plantas-historial').then(m => m.PlantasHistorialComponent),
    canActivate: [authGuard]
  }
];
