import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { switchMap } from 'rxjs';
import { RecetasService } from '../../services/recetas.service';
import { AuthService } from '../../services/auth';
import { RecetaCardComponent } from '../../shared/components/receta-card/receta-card';
import { RecetaWindowComponent } from '../../shared/components/receta-window/receta-window';
import { RecetaHuerto } from '../../models/interfaces';

type TipoDieta = 'VEGETARIANA' | 'VEGANA' | 'OMNIVORA';

@Component({
  selector: 'app-recetas',
  standalone: true,
  imports: [CommonModule, FormsModule, RecetaCardComponent, RecetaWindowComponent],
  templateUrl: './recetas.html',
  styleUrls: ['./recetas.scss']
})
export class RecetasComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly recetasService = inject(RecetasService);

  recipes: RecetaHuerto[] = [];
  filteredRecipes: RecetaHuerto[] = [];
  selectedRecipe: RecetaHuerto | null = null;
  searchTerm = '';
  cargando = false;

  dietaUsuario: TipoDieta = 'OMNIVORA';

  readonly dietaChips: { value: TipoDieta; label: string }[] = [
    { value: 'VEGETARIANA', label: '🥬 Vegetariana' },
    { value: 'VEGANA',      label: '🌱 Vegana'      },
    { value: 'OMNIVORA',    label: '🍖 Omnívora'    }
  ];

  dietasActivas = new Set<TipoDieta>([this.dietaUsuario]);

  ngOnInit(): void {
    const usuario = this.authService.getStoredUser();
    if (usuario?.tipo_dieta) {
      this.dietaUsuario = usuario.tipo_dieta as TipoDieta;
    }
    this.dietasActivas = new Set<TipoDieta>([this.dietaUsuario]);

    this.cargarFeed();
  }

  private cargarFeed(): void {
    // TODO: sustituir por el usuario_id real una vez exista el mapeo entre
    // el uid de Firebase (AuthService) y el usuario_id numérico de Postgres.
    const usuarioId = 1;

    this.cargando = true;
    this.recetasService.getPlantasUsuarioIds(usuarioId).pipe(
      switchMap(idsPlantas => this.recetasService.getFeed(idsPlantas))
    ).subscribe({
      next: (recetas) => {
        this.recipes = recetas;
        this.cargando = false;
        this.applyFilters();
      },
      error: (err) => {
        console.error('Error al cargar el feed de recetas:', err);
        this.cargando = false;
      }
    });
  }

  toggleDieta(dieta: TipoDieta): void {
    if (this.dietasActivas.has(dieta)) {
      this.dietasActivas.delete(dieta);
    } else {
      this.dietasActivas.add(dieta);
    }
    this.dietasActivas = new Set(this.dietasActivas);
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let result = [...this.recipes];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(r =>
        r.nombre_receta.toLowerCase().includes(term) ||
        (r.descripcion ?? '').toLowerCase().includes(term)
      );
    }

    if (this.dietasActivas.size > 0) {
      result = result.filter(r => this.dietasActivas.has(r.tipo_dieta as TipoDieta));
    }

    result.sort((a, b) => a.ingredientes_faltantes - b.ingredientes_faltantes);

    this.filteredRecipes = result;
  }

  openRecipeDetail(recipe: RecetaHuerto): void { this.selectedRecipe = recipe; }
  closeRecipeDetail(): void { this.selectedRecipe = null; }

  getDietaText(): string {
    const map: Record<TipoDieta, string> = {
      'VEGANA': '🌱 Vegana', 'VEGETARIANA': '🥬 Vegetariana', 'OMNIVORA': '🍖 Omnívora'
    };
    return map[this.dietaUsuario];
  }
}
