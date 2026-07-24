import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { RecetasService } from '../../services/recetas.service';
import { AuthService } from '../../services/auth';
import { RecetaCardComponent } from '../../shared/components/receta-card/receta-card';
import { RecetaWindowComponent } from '../../shared/components/receta-window/receta-window';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';
import { RecetaHuerto } from '../../models/interfaces';

type TipoDieta = 'VEGETARIANA' | 'VEGANA' | 'OMNIVORA';
type CategoriaFiltro = 'PRINCIPAL' | 'ENTRANTE' | 'POSTRE' | 'BEBIDA' | 'GUARNICION' | 'SALSA';

@Component({
  selector: 'app-recetas',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCheckboxModule, PageHeaderComponent, RecetaCardComponent, RecetaWindowComponent],
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

  readonly usuario = toSignal(this.authService.currentUser$, {
    initialValue: this.authService.getStoredUser()
  });

  get usuarioId(): number {
    return this.usuario()?.usuario_id ?? 0;
  }

  dietaUsuario: TipoDieta = 'OMNIVORA';

  readonly dietaChips: { value: TipoDieta; label: string }[] = [
    { value: 'OMNIVORA',    label: 'Omnívora'    },
    { value: 'VEGETARIANA', label: 'Vegetariana' },
    { value: 'VEGANA',      label: 'Vegana'      }
  ];

  // Selección múltiple, igual que categoriasActivas: vacío = todas las dietas.
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
    // usuarioId ya se resuelve de forma reactiva vía el getter de arriba.
    const usuario = this.usuario();
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

  // Regla de inclusión Vegana ⊂ Vegetariana ⊂ Omnívora: una receta cumple un
  // filtro de dieta si su tipo_dieta es igual o "más restrictivo" que el filtro.
  private cumpleFiltroDieta(tipoDietaReceta: string, filtro: TipoDieta): boolean {
    switch (filtro) {
      case 'VEGANA':      return tipoDietaReceta === 'VEGANA';
      case 'VEGETARIANA': return tipoDietaReceta === 'VEGETARIANA' || tipoDietaReceta === 'VEGANA';
      case 'OMNIVORA':    return true;
    }
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

    // Unión: con varias dietas marcadas se incluyen las recetas que cumplan
    // CUALQUIERA de ellas (regla de inclusión Vegana ⊂ Vegetariana ⊂ Omnívora).
    if (this.dietasActivas.size > 0) {
      const filtros = [...this.dietasActivas];
      result = result.filter(r => filtros.some(f => this.cumpleFiltroDieta((r.tipo_dieta ?? '').toUpperCase().trim(), f)));
    }

    // Sin reordenar: se respeta el orden que ya devuelve la API (id_receta ASC).
    this.filteredRecipes.set(result);
  }

  openRecipeDetail(recipe: RecetaHuerto): void { this.selectedRecipe = recipe; }
  closeRecipeDetail(): void { this.selectedRecipe = null; }

  getDietaText(): string {
    const map: Record<TipoDieta, string> = {
      'VEGANA': 'Vegana', 'VEGETARIANA': 'Vegetariana', 'OMNIVORA': 'Omnívora'
    };
    return map[this.dietaUsuario];
  }
}
