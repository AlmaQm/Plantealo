import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { PlantasComponent } from './pages/plantas/plantas';
import { ComunidadComponent } from './pages/comunidad/comunidad';
import { RecetasComponent } from './pages/recetas/recetas';
import { PerfilComponent } from './pages/perfil/perfil';

export const routes: Routes = [
   { path: '', redirectTo: '/home', pathMatch: 'full' },
   { path: 'home', component: HomeComponent },
   { path: 'plantas', component: PlantasComponent },
   { path: 'comunidad', component: ComunidadComponent },
   { path: 'recetas', component: RecetasComponent },
   { path: 'perfil', component: PerfilComponent },
   { path: '**', redirectTo: '/home' }
];
