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

  ngOnInit(): void {
    this.siguiendo = signal(this.publicacion.siguiendo);
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
