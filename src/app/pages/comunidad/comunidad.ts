import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PublicacionCardComponent } from '../../shared/components/publicacion-card/publicacion-card';
import { Publicacion } from '../../models/interfaces';
import { ComunidadService } from '../../services/comunidad';

@Component({
  selector: 'app-comunidad',
  standalone: true,
  imports: [CommonModule, FormsModule, PublicacionCardComponent],
  templateUrl: './comunidad.html',
  styleUrls: ['./comunidad.scss']
})
export class Comunidad {
  private readonly comunidadService = inject(ComunidadService);

  readonly feed = this.comunidadService.feed;
  modalAbierto = signal(false);
  publicando = signal(false);
  error = signal('');

  nuevaDesc = signal('');
  nuevaCategoria = signal<Publicacion['categoria']>('HUERTO');
  nuevaImagenPreview = signal('');
  private nuevaImagenFile: File | null = null;

  readonly categorias: Publicacion['categoria'][] = ['HUERTO', 'RECETA', 'CONSEJO', 'COSECHA'];

  abrirModal(): void {
    this.nuevaDesc.set('');
    this.nuevaCategoria.set('HUERTO');
    this.nuevaImagenFile = null;
    this.nuevaImagenPreview.set('');
    this.error.set('');
    this.modalAbierto.set(true);
  }

  onImagenSeleccionada(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.nuevaImagenFile = file;
      this.nuevaImagenPreview.set(URL.createObjectURL(file));
    }
  }

  cerrarModal(): void {
    this.modalAbierto.set(false);
  }

  async publicar(): Promise<void> {
    const desc = this.nuevaDesc().trim();
    if (!desc || this.publicando()) return;

    this.publicando.set(true);
    this.error.set('');
    try {
      await this.comunidadService.crearPublicacion(desc, this.nuevaCategoria(), this.nuevaImagenFile ?? undefined);
      this.cerrarModal();
    } catch (e) {
      console.error('Error al publicar en comunidad:', e);
      const codigo = (e as { code?: string })?.code ?? (e as Error)?.message ?? 'desconocido';
      this.error.set(`No se ha podido publicar (${codigo}).`);
    } finally {
      this.publicando.set(false);
    }
  }
}
