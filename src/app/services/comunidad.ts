import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Auth, authState } from '@angular/fire/auth';
import { environment } from '../../environments/environment';
import { AuthService } from './auth';
import { Comentario, Publicacion } from '../models/interfaces';

interface ApiComentario {
  comentario_id: number;
  usuario_id: string;
  nombre_usuario: string;
  username: string;
  texto: string;
  fecha: string;
}

interface ApiPublicacion {
  publicacion_id: number;
  usuario_id: string;
  nombre_usuario: string;
  username: string;
  avatar_inicial: string;
  imagen_url: string | null;
  categoria: Publicacion['categoria'];
  descripcion: string;
  fecha: string;
  likes: number;
  liked: boolean;
  comentarios: ApiComentario[];
}

@Injectable({ providedIn: 'root' })
export class ComunidadService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(Auth);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/publicaciones`;

  private uid: string | null = null;

  get miUid(): string | null {
    return this.auth.currentUser?.uid ?? null;
  }

  private readonly feedSignal = signal<Publicacion[]>([]);
  readonly feed = this.feedSignal.asReadonly();

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;

    authState(this.auth).subscribe(user => {
      this.uid = user?.uid ?? null;
      this.cargarFeed();
    });

    this.cargarFeed();
  }

  private async cargarFeed(): Promise<void> {
    try {
      const params: Record<string, string> = {};
      if (this.uid) params['uid'] = this.uid;
      const docs = await firstValueFrom(
        this.http.get<ApiPublicacion[]>(this.apiUrl + '/', { params })
      );
      this.feedSignal.set(docs.map(d => this.mapPublicacion(d)));
    } catch (e) {
      console.error('Error al cargar el feed de comunidad:', e);
    }
  }

  private mapPublicacion(d: ApiPublicacion): Publicacion {
    return {
      publicacion_id: String(d.publicacion_id),
      usuario_id: d.usuario_id,
      nombre_usuario: d.nombre_usuario,
      username: d.username,
      avatar_inicial: d.avatar_inicial,
      imagen_url: d.imagen_url ?? 'assets/images/placeholder-receta.jpg',
      categoria: d.categoria,
      descripcion: d.descripcion,
      fecha: new Date(d.fecha),
      likes: d.likes,
      liked: d.liked,
      siguiendo: false,
      comentarios: d.comentarios.map(c => this.mapComentario(c))
    };
  }

  private mapComentario(c: ApiComentario): Comentario {
    return {
      comentario_id: String(c.comentario_id),
      usuario_id: c.usuario_id,
      nombre_usuario: c.nombre_usuario,
      username: c.username,
      texto: c.texto,
      fecha: new Date(c.fecha)
    };
  }

  private actualizarEnFeed(pub: ApiPublicacion): void {
    const mapeada = this.mapPublicacion(pub);
    this.feedSignal.update(feed => {
      const existe = feed.some(p => p.publicacion_id === mapeada.publicacion_id);
      return existe
        ? feed.map(p => p.publicacion_id === mapeada.publicacion_id ? mapeada : p)
        : [mapeada, ...feed];
    });
  }

  async crearPublicacion(
    descripcion: string,
    categoria: Publicacion['categoria'],
    imagenFile?: File
  ): Promise<void> {
    const firebaseUser = this.auth.currentUser;
    if (!firebaseUser) {
      throw new Error('Debes iniciar sesión para publicar');
    }
    const usuario = this.authService.getStoredUser();
    const nombre = usuario?.nombre || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuario';
    const nombreUsuario = usuario?.nombre_usuario || firebaseUser.email?.split('@')[0] || 'usuario';

    const nuevaPub = await firstValueFrom(this.http.post<ApiPublicacion>(this.apiUrl + '/', {
      usuario_id: firebaseUser.uid,
      nombre_usuario: nombre,
      username: `@${nombreUsuario}`,
      avatar_inicial: nombre.charAt(0).toUpperCase(),
      categoria,
      descripcion,
      imagen_url: null
    }));

    this.actualizarEnFeed(nuevaPub);

    if (imagenFile) {
      this.guardarImagenEnSegundoPlano(nuevaPub.publicacion_id, imagenFile);
    }
  }

  async editarPublicacion(
    publicacionId: string,
    descripcion: string,
    categoria: Publicacion['categoria']
  ): Promise<void> {
    const firebaseUser = this.auth.currentUser;
    if (!firebaseUser) {
      throw new Error('Debes iniciar sesión para editar');
    }
    const actualizada = await firstValueFrom(
      this.http.put<ApiPublicacion>(`${this.apiUrl}/${publicacionId}`, {
        usuario_id: firebaseUser.uid,
        categoria,
        descripcion
      })
    );
    this.actualizarEnFeed(actualizada);
  }

  async eliminarPublicacion(publicacionId: string): Promise<void> {
    const firebaseUser = this.auth.currentUser;
    if (!firebaseUser) {
      throw new Error('Debes iniciar sesión para eliminar');
    }
    await firstValueFrom(
      this.http.delete(`${this.apiUrl}/${publicacionId}`, { params: { usuario_id: firebaseUser.uid } })
    );
    this.feedSignal.update(feed => feed.filter(p => p.publicacion_id !== publicacionId));
  }

  private async guardarImagenEnSegundoPlano(publicacionId: number, imagenFile: File): Promise<void> {
    try {
      const imagen_url = await this.comprimirImagen(imagenFile);
      const actualizada = await firstValueFrom(
        this.http.patch<ApiPublicacion>(`${this.apiUrl}/${publicacionId}/imagen`, { imagen_url })
      );
      this.actualizarEnFeed(actualizada);
    } catch (e) {
      console.error('Error al guardar la imagen de la publicación:', e);
    }
  }

  private async comprimirImagen(file: File, maxDimension = 1280, calidad = 0.75): Promise<string> {
    const bitmap = await createImageBitmap(file);
    const escala = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * escala);
    const height = Math.round(bitmap.height * escala);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, width, height);

    return canvas.toDataURL('image/jpeg', calidad);
  }

  async toggleLike(publicacionId: string, _currentlyLiked: boolean): Promise<void> {
    if (!this.uid) return;
    const actualizada = await firstValueFrom(
      this.http.post<ApiPublicacion>(`${this.apiUrl}/${publicacionId}/like`, { usuario_id: this.uid })
    );
    this.actualizarEnFeed(actualizada);
  }

  async agregarComentario(publicacionId: string, texto: string): Promise<void> {
    const firebaseUser = this.auth.currentUser;
    if (!firebaseUser) return;
    const usuario = this.authService.getStoredUser();
    const nombre = usuario?.nombre || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuario';
    const nombreUsuario = usuario?.nombre_usuario || firebaseUser.email?.split('@')[0] || 'usuario';

    const actualizada = await firstValueFrom(
      this.http.post<ApiPublicacion>(`${this.apiUrl}/${publicacionId}/comentarios`, {
        usuario_id: firebaseUser.uid,
        nombre_usuario: nombre,
        username: `@${nombreUsuario}`,
        texto
      })
    );
    this.actualizarEnFeed(actualizada);
  }
}
