import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PublicacionCardComponent } from '../../shared/components/publicacion-card/publicacion-card';
import { Publicacion } from '../../models/interfaces';
import { COMUNIDAD_DATA } from '../../data/comunidad.data';

@Component({
  selector: 'app-comunidad',
  standalone: true,
  imports: [CommonModule, FormsModule, PublicacionCardComponent],
  templateUrl: './comunidad.html',
  styleUrls: ['./comunidad.scss']
})
export class Comunidad {

  feed = signal<Publicacion[]>([...COMUNIDAD_DATA]);
  modalAbierto = signal(false);

  nuevaDesc = signal('');
  nuevaCategoria = signal<Publicacion['categoria']>('HUERTO');
  nuevaImagenUrl = signal('');

  readonly categorias: Publicacion['categoria'][] = ['HUERTO', 'RECETA', 'CONSEJO', 'COSECHA'];

  abrirModal(): void {
    this.nuevaDesc.set('');
    this.nuevaCategoria.set('HUERTO');
    this.nuevaImagenUrl.set('');
    this.modalAbierto.set(true);
  }

  cerrarModal(): void {
    this.modalAbierto.set(false);
  }

  publicar(): void {
    const desc = this.nuevaDesc().trim();
    if (!desc) return;

    const nueva: Publicacion = {
      publicacion_id: Date.now(),
      usuario_id: 1,
      nombre_usuario: 'Tú',
      username: '@mi_huerto',
      avatar_inicial: 'T',
      imagen_url: this.nuevaImagenUrl().trim() || 'assets/images/placeholder-receta.jpg',
      categoria: this.nuevaCategoria(),
      descripcion: desc,
      likes: 0,
      liked: false,
      comentarios: [],
      fecha: new Date(),
      siguiendo: false
    };

    this.feed.update(f => [nueva, ...f]);
    this.cerrarModal();
  }
}
