import { Component, OnDestroy, OnInit, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '@angular/fire/auth';
import { AuthService } from '../../../services/auth';
import { MensajesService } from '../../../services/mensajes';
import { MensajeChat } from '../../../models/interfaces';

const INTERVALO_REFRESCO_MS = 4000;

@Component({
  selector: 'app-chat-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-modal.html',
  styleUrls: ['./chat-modal.scss'],
})
export class ChatModalComponent implements OnInit, OnDestroy {
  private readonly auth = inject(Auth);
  private readonly authService = inject(AuthService);
  private readonly mensajesService = inject(MensajesService);

  intercambioId = input.required<number>();
  otroUid = input.required<string>();
  otroNombre = input.required<string>();
  nombrePlanta = input.required<string>();

  cerrar = output<void>();

  mensajes = signal<MensajeChat[]>([]);
  texto = signal('');
  cargando = signal(true);
  enviando = signal(false);
  error = signal('');

  private intervalo?: ReturnType<typeof setInterval>;

  get miUid(): string | null {
    return this.auth.currentUser?.uid ?? null;
  }

  ngOnInit(): void {
    this.cargar();
    this.intervalo = setInterval(() => this.cargar(true), INTERVALO_REFRESCO_MS);
  }

  ngOnDestroy(): void {
    if (this.intervalo) clearInterval(this.intervalo);
  }

  private async cargar(silencioso = false): Promise<void> {
    if (!silencioso) this.cargando.set(true);
    try {
      const datos = await this.mensajesService.listarMensajes(this.intercambioId(), this.otroUid());
      this.mensajes.set(datos);
      this.error.set('');
    } catch (e) {
      console.error('Error al cargar la conversación:', e);
      if (!silencioso) this.error.set('No se ha podido cargar la conversación.');
    } finally {
      if (!silencioso) this.cargando.set(false);
    }
  }

  async enviar(): Promise<void> {
    const texto = this.texto().trim();
    if (!texto || this.enviando()) return;

    const usuario = this.authService.getStoredUser();
    if (!usuario) return;

    this.enviando.set(true);
    try {
      await this.mensajesService.enviarMensaje(this.intercambioId(), this.otroUid(), usuario.nombre, texto);
      this.texto.set('');
      await this.cargar(true);
    } catch (e) {
      console.error('Error al enviar el mensaje:', e);
      this.error.set('No se ha podido enviar el mensaje.');
    } finally {
      this.enviando.set(false);
    }
  }
}
