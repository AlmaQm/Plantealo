import { Component, Input, OnInit, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Publicacion } from '../../../models/interfaces';
import { ComunidadService } from '../../../services/comunidad';

@Component({
  selector: 'app-publicacion-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './publicacion-card.html',
  styleUrls: ['./publicacion-card.scss']
})
export class PublicacionCardComponent implements OnInit {
  @Input() publicacion!: Publicacion;

  private readonly comunidadService = inject(ComunidadService);

  siguiendo!: WritableSignal<boolean>;
  mostrarComentarios = signal(false);
  expandirDesc = signal(false);
  nuevoComentario = signal('');
  procesandoLike = signal(false);
  enviandoComentario = signal(false);

  editando = signal(false);
  categoriaEdit = signal<Publicacion['categoria']>('HUERTO');
  descripcionEdit = signal('');
  guardandoEdicion = signal(false);
  eliminando = signal(false);

  readonly categorias: Publicacion['categoria'][] = ['HUERTO', 'RECETA', 'CONSEJO', 'COSECHA'];

  ngOnInit(): void {
    this.siguiendo = signal(this.publicacion.siguiendo);
  }

  get esPropia(): boolean {
    return this.publicacion.usuario_id === this.comunidadService.miUid;
  }

  iniciarEdicion(): void {
    this.categoriaEdit.set(this.publicacion.categoria);
    this.descripcionEdit.set(this.publicacion.descripcion);
    this.editando.set(true);
  }

  cancelarEdicion(): void {
    this.editando.set(false);
  }

  async guardarEdicion(): Promise<void> {
    const texto = this.descripcionEdit().trim();
    if (!texto || this.guardandoEdicion()) return;
    this.guardandoEdicion.set(true);
    try {
      await this.comunidadService.editarPublicacion(this.publicacion.publicacion_id, texto, this.categoriaEdit());
      this.editando.set(false);
    } catch (e) {
      console.error('Error al editar la publicación:', e);
    } finally {
      this.guardandoEdicion.set(false);
    }
  }

  async eliminar(): Promise<void> {
    if (this.eliminando()) return;
    if (!confirm('¿Eliminar esta publicación? No se puede deshacer.')) return;
    this.eliminando.set(true);
    try {
      await this.comunidadService.eliminarPublicacion(this.publicacion.publicacion_id);
    } catch (e) {
      console.error('Error al eliminar la publicación:', e);
      this.eliminando.set(false);
    }
  }

  async toggleLike(): Promise<void> {
    if (this.procesandoLike()) return;
    this.procesandoLike.set(true);
    try {
      await this.comunidadService.toggleLike(this.publicacion.publicacion_id, this.publicacion.liked);
    } finally {
      this.procesandoLike.set(false);
    }
  }

  toggleSeguir(): void {
    this.siguiendo.update(v => !v);
  }

  toggleComentarios(): void {
    this.mostrarComentarios.update(v => !v);
  }

  async enviarComentario(): Promise<void> {
    const texto = this.nuevoComentario().trim();
    if (!texto || this.enviandoComentario()) return;

    this.enviandoComentario.set(true);
    try {
      await this.comunidadService.agregarComentario(this.publicacion.publicacion_id, texto);
      this.nuevoComentario.set('');
    } finally {
      this.enviandoComentario.set(false);
    }
  }

  formatFecha(fecha: Date): string {
    return new Date(fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }

  getCategoriaLabel(): string {
    const map: Record<Publicacion['categoria'], string> = {
      'HUERTO': '🌿 Huerto', 'RECETA': '🍳 Receta',
      'CONSEJO': '💡 Consejo', 'COSECHA': '🌾 Cosecha'
    };
    return map[this.publicacion.categoria];
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/images/placeholder-receta.jpg';
  }
}
