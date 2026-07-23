import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RecetasService } from '../../../services/recetas.service';
import { ComunidadService } from '../../../services/comunidad';
import { RecetaBase, Publicacion } from '../../../models/interfaces';

type GuardadasTab = 'RECETAS' | 'POSTS';

@Component({
  selector: 'app-guardadas-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './guardadas-tabs.html',
  styleUrls: ['./guardadas-tabs.scss']
})
export class GuardadasTabsComponent implements OnInit {
  private readonly recetasService = inject(RecetasService);
  private readonly comunidadService = inject(ComunidadService);
  private readonly router = inject(Router);

  @Input() usuarioId!: number;

  readonly tabActiva = signal<GuardadasTab>('RECETAS');
  readonly recetasGuardadas = signal<RecetaBase[]>([]);
  readonly postsGuardados = signal<Publicacion[]>([]);
  readonly cargandoRecetas = signal(false);
  readonly cargandoPosts = signal(false);

  private recetasCargadas = false;
  private postsCargados = false;

  ngOnInit(): void {
    this.cargarRecetas();
  }

  setTab(tab: GuardadasTab): void {
    this.tabActiva.set(tab);
    if (tab === 'RECETAS') {
      this.cargarRecetas();
    } else {
      this.cargarPosts();
    }
  }

  private cargarRecetas(): void {
    if (this.recetasCargadas) return;
    this.cargandoRecetas.set(true);
    this.recetasService.getRecetasGuardadas(this.usuarioId).subscribe({
      next: (recetas) => {
        this.recetasGuardadas.set(recetas);
        this.recetasCargadas = true;
        this.cargandoRecetas.set(false);
      },
      error: (err) => {
        console.error('Error al cargar recetas guardadas:', err);
        this.cargandoRecetas.set(false);
      }
    });
  }

  private cargarPosts(): void {
    if (this.postsCargados) return;
    this.cargandoPosts.set(true);
    this.comunidadService.getPublicacionesGuardadas()
      .then(posts => {
        this.postsGuardados.set(posts);
        this.postsCargados = true;
      })
      .catch(err => console.error('Error al cargar publicaciones guardadas:', err))
      .finally(() => this.cargandoPosts.set(false));
  }

  verTodasRecetas(): void {
    this.router.navigate(['/recetas']);
  }

  verTodasPosts(): void {
    this.router.navigate(['/comunidad']);
  }
}
