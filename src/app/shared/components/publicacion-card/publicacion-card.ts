import { Component, Input, OnInit, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Publicacion, Comentario } from '../../../models/interfaces';

@Component({
  selector: 'app-publicacion-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './publicacion-card.html',
  styleUrls: ['./publicacion-card.scss']
})
export class PublicacionCardComponent implements OnInit {
  @Input() publicacion!: Publicacion;

  liked!: WritableSignal<boolean>;
  likes!: WritableSignal<number>;
  siguiendo!: WritableSignal<boolean>;
  comentarios!: WritableSignal<Comentario[]>;
  mostrarComentarios = signal(false);
  expandirDesc = signal(false);
  nuevoComentario = signal('');

  ngOnInit(): void {
    this.liked = signal(this.publicacion.liked);
    this.likes = signal(this.publicacion.likes);
    this.siguiendo = signal(this.publicacion.siguiendo);
    this.comentarios = signal([...this.publicacion.comentarios]);
  }

  toggleLike(): void {
    this.liked.update(v => !v);
    this.likes.update(n => this.liked() ? n + 1 : n - 1);
  }

  toggleSeguir(): void {
    this.siguiendo.update(v => !v);
  }

  toggleComentarios(): void {
    this.mostrarComentarios.update(v => !v);
  }

  enviarComentario(): void {
    const texto = this.nuevoComentario().trim();
    if (!texto) return;
    const nuevo: Comentario = {
      comentario_id: Date.now(),
      usuario_id: 1,
      nombre_usuario: 'Tú',
      username: '@mi_huerto',
      texto,
      fecha: new Date()
    };
    this.comentarios.update(list => [...list, nuevo]);
    this.nuevoComentario.set('');
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
