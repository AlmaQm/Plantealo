import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Auth } from '@angular/fire/auth';
import { environment } from '../../environments/environment';
import { MensajeChat, ConversacionResumen } from '../models/interfaces';

interface ApiMensaje {
  id: number;
  intercambio_id: number;
  remitente_uid: string;
  remitente_nombre: string;
  destinatario_uid: string;
  texto: string;
  fecha: string;
}

interface ApiConversacionResumen {
  intercambio_id: number;
  nombre_planta: string;
  otro_uid: string;
  otro_nombre: string;
  ultimo_mensaje: string;
  ultima_fecha: string;
  no_leidos: number;
}

@Injectable({ providedIn: 'root' })
export class MensajesService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(Auth);
  private readonly apiUrl = environment.apiUrl;

  // El backend verifica este token con el Admin SDK de Firebase: el uid del
  // remitente sale siempre de aqui, nunca de lo que mande el cliente en el body.
  private async authHeaders(): Promise<{ Authorization: string }> {
    const token = await this.auth.currentUser?.getIdToken();
    if (!token) throw new Error('Debes iniciar sesión para usar el chat');
    return { Authorization: `Bearer ${token}` };
  }

  private mapMensaje(d: ApiMensaje): MensajeChat {
    return {
      id: d.id,
      intercambio_id: d.intercambio_id,
      remitente_uid: d.remitente_uid,
      remitente_nombre: d.remitente_nombre,
      destinatario_uid: d.destinatario_uid,
      texto: d.texto,
      fecha: new Date(d.fecha),
    };
  }

  private mapConversacion(d: ApiConversacionResumen): ConversacionResumen {
    return {
      intercambio_id: d.intercambio_id,
      nombre_planta: d.nombre_planta,
      otro_uid: d.otro_uid,
      otro_nombre: d.otro_nombre,
      ultimo_mensaje: d.ultimo_mensaje,
      ultima_fecha: new Date(d.ultima_fecha),
      no_leidos: d.no_leidos,
    };
  }

  async listarMensajes(intercambioId: number, conUid: string): Promise<MensajeChat[]> {
    const headers = await this.authHeaders();
    const docs = await firstValueFrom(
      this.http.get<ApiMensaje[]>(`${this.apiUrl}/intercambios/${intercambioId}/mensajes`, {
        headers,
        params: { con: conUid },
      })
    );
    return docs.map(d => this.mapMensaje(d));
  }

  async enviarMensaje(
    intercambioId: number, destinatarioUid: string, remitenteNombre: string, texto: string
  ): Promise<MensajeChat> {
    const headers = await this.authHeaders();
    const creado = await firstValueFrom(
      this.http.post<ApiMensaje>(
        `${this.apiUrl}/intercambios/${intercambioId}/mensajes`,
        { destinatario_uid: destinatarioUid, remitente_nombre: remitenteNombre, texto },
        { headers }
      )
    );
    return this.mapMensaje(creado);
  }

  async listarConversaciones(): Promise<ConversacionResumen[]> {
    const headers = await this.authHeaders();
    const docs = await firstValueFrom(
      this.http.get<ApiConversacionResumen[]>(`${this.apiUrl}/mensajes/conversaciones`, { headers })
    );
    return docs.map(d => this.mapConversacion(d));
  }

  async contarNoLeidos(): Promise<number> {
    const headers = await this.authHeaders();
    return firstValueFrom(
      this.http.get<number>(`${this.apiUrl}/mensajes/no-leidos`, { headers })
    );
  }
}
