import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { switchMap } from 'rxjs';
import { RecetasService } from '../../services/recetas.service';
import { AuthService } from '../../services/auth';
import { RecetaCardComponent } from '../../shared/components/receta-card/receta-card';
import { RecetaWindowComponent } from '../../shared/components/receta-window/receta-window';
import { RecetaHuerto } from '../../models/interfaces';

type TipoDieta = 'VEGETARIANA' | 'VEGANA' | 'OMNIVORA';
type CategoriaFiltro = 'PRINCIPAL' | 'ENTRANTE' | 'POSTRE' | 'BEBIDA' | 'GUARNICION' | 'SALSA';

@Component({
  selector: 'app-recetas',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCheckboxModule, RecetaCardComponent, RecetaWindowComponent],
  templateUrl: './recetas.html',
  styleUrls: ['./recetas.scss']
})
export class RecetasComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly recetasService = inject(RecetasService);

  recipes: RecetaHuerto[] = [];
  // Signals: esta app no usa zone.js, así que las propiedades planas que
  // pinta la plantilla y se mutan dentro de un .subscribe() async no
  // disparan detección de cambios por sí solas. Con signal() sí.
  filteredRecipes = signal<RecetaHuerto[]>([]);
  selectedRecipe: RecetaHuerto | null = null;
  searchTerm = '';
  cargando = signal(false);

  // TODO: sustituir por el usuario_id real una vez exista el mapeo entre
  // el uid de Firebase (AuthService) y el usuario_id numérico de Postgres.
  readonly usuarioId = 1;

  dietaUsuario: TipoDieta = 'OMNIVORA';

  readonly dietaChips: { value: TipoDieta; label: string }[] = [
    { value: 'OMNIVORA',    label: 'Omnívora'    },
    { value: 'VEGETARIANA', label: 'Vegetariana' },
    { value: 'VEGANA',      label: 'Vegana'      }
  ];

  // Vacío a propósito: sin dieta preseleccionada se muestran todas las recetas
  // al entrar. El usuario activa un chip solo si quiere filtrar.
  dietasActivas = new Set<TipoDieta>();

  readonly categoriaChips: { value: CategoriaFiltro; label: string }[] = [
    { value: 'PRINCIPAL',   label: 'Platos Principales' },
    { value: 'ENTRANTE',    label: 'Entrantes' },
    { value: 'GUARNICION',  label: 'Guarniciones' },
    { value: 'SALSA',       label: 'Salsas' },
    { value: 'POSTRE',      label: 'Postres' },
    { value: 'BEBIDA',      label: 'Bebidas' }
  ];

  // Selección múltiple: vacío = todas las categorías.
  categoriasActivas = new Set<CategoriaFiltro>();

  // Panel plegable de filtros dentro del sticky header (dieta + categoría).
  readonly filtrosAbiertos = signal(false);

  ngOnInit(): void {
    // Solo para el texto del subtítulo ("...preferencias Omnívora"); ya NO
    // se usa para preseleccionar ningún chip de dieta como filtro activo.
    const usuario = this.authService.getStoredUser();
    if (usuario?.tipo_dieta) {
      this.dietaUsuario = usuario.tipo_dieta as TipoDieta;
    }

    this.cargarFeed();
  }

  private cargarFeed(): void {
    this.cargando.set(true);
    this.recetasService.getPlantasUsuarioIds(this.usuarioId).pipe(
      switchMap(idsPlantas => this.recetasService.getFeed(idsPlantas, this.usuarioId))
    ).subscribe({
      next: (recetas) => {
        this.recipes = recetas;
        this.cargando.set(false);
        this.applyFilters();
      },
      error: (err) => {
        console.error('Error al cargar el feed de recetas:', err);
        this.cargando.set(false);
      }
    });
  }

  toggleCategoria(categoria: CategoriaFiltro): void {
    // Selección múltiple: cada categoría se marca/desmarca de forma independiente.
    if (this.categoriasActivas.has(categoria)) {
      this.categoriasActivas.delete(categoria);
    } else {
      this.categoriasActivas.add(categoria);
    }
    this.categoriasActivas = new Set(this.categoriasActivas);
    this.applyFilters();
  }

  toggleFiltros(): void {
    this.filtrosAbiertos.update(v => !v);
  }

  filtrosActivos(): number {
    return this.dietasActivas.size + this.categoriasActivas.size;
  }

  toggleDieta(dieta: TipoDieta): void {
    // Selección múltiple libre, igual que toggleCategoria(): cada dieta se
    // marca/desmarca de forma independiente, sin exclusividad ni cascada.
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

    if (this.categoriasActivas.size > 0) {
      result = result.filter(r => this.categoriasActivas.has((r.categoria ?? '').toUpperCase().trim() as CategoriaFiltro));
    }

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(r =>
        r.nombre_receta.toLowerCase().includes(term) ||
        (r.descripcion ?? '').toLowerCase().includes(term)
      );
    }

    // Selección múltiple libre: sin filtro activo se ven todas; con uno o
    // más marcados, solo las recetas cuyo tipo_dieta coincida con alguno
    // de los seleccionados (mismo patrón que categoriasActivas).
    if (this.dietasActivas.size > 0) {
      result = result.filter(r => this.dietasActivas.has(r.tipo_dieta as TipoDieta));
    }

    result.sort((a, b) => a.ingredientes_faltantes - b.ingredientes_faltantes);

    this.filteredRecipes.set(result);
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
