import { Component, effect, inject, input, output, signal, ViewChild, ElementRef, Injector, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { PlantasService } from '../../services/plantas';
import { environment } from '../../../environments/environment';

interface Missatge {
  rol: 'assistant' | 'user';
  text: string;
  imatge?: string | null;  // base64 de la imatge, si n'hi ha
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrls: ['./chat.scss'],
})
export class ChatComponent {
  private plantasService = inject(PlantasService);
  private http = inject(HttpClient);
  private injector = inject(Injector);

  @ViewChild('missatgesRef') missatgesRef!: ElementRef<HTMLDivElement>;

  // --- API pública ---
  obert = input<boolean>(false);
  tancar = output<void>();

  // --- Estat intern ---
  missatges = signal<Missatge[]>([]);
  inputText = signal('');
  carregant = signal(false);
  imatgeBase64 = signal<string | null>(null);

  constructor() {
    // Quan el panell s'obre i encara no hi ha cap missatge, mostra la benvinguda.
    effect(() => {
      if (this.obert() && this.missatges().length === 0) {
        this.afegirBenvinguda();
      }
    });
  }

  private afegirBenvinguda(): void {
    const inventari = this.plantasService.inventario();
    const noms = inventari.map(p => p.nombre_planta);
    const text = inventari.length > 0
      ? `🌱 ¡Hola! Bienvenido a tu huerto. Tienes ${inventari.length} plantas: ${noms.join(', ')}. ¿Qué necesitas?`
      : `🌱 ¡Hola! Bienvenido a tu huerto. Aún no tienes plantas registradas. ¿Qué necesitas?`;
    this.missatges.set([{ rol: 'assistant', text }]);
    this.scrollAlFinal();
  }

  private scrollAlFinal(): void {
    afterNextRender(() => {
      const el = this.missatgesRef?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }, { injector: this.injector });
  }

  enviarMissatge(): void {
    const text = this.inputText().trim();
    // Permet enviar si hi ha text O imatge (no cal text si s'adjunta foto)
    if ((!text && !this.imatgeBase64()) || this.carregant()) return;

    // Si només hi ha imatge sense text, usa un text per defecte
    const textFinal = text || '📷';

    // Captura la imatge abans de netejar el signal, perquè la necessitem
    // tant a la bombolla com al body de la petició.
    const imatge = this.imatgeBase64();

    // 1. Missatge de l'usuari
    this.missatges.update(m => [...m, {
      rol: 'user',
      text: textFinal,
      imatge
    }]);
    this.imatgeBase64.set(null);  // la preview desapareix immediatament
    this.scrollAlFinal();
    // 2. Neteja l'input
    this.inputText.set('');
    // 3. Estat de càrrega
    this.carregant.set(true);

    // 4. Crida al backend
    const plantes = this.plantasService.inventario().map(p => p.nombre_planta);
    const body = {
      mensaje: textFinal,
      plantas: plantes,
      imagen_base64: imatge,
    };

    this.http.post<{ respuesta: string }>(`${environment.apiUrl}/chat/`, body).subscribe({
      next: (res) => {
        // 5. Resposta de l'assistent
        this.missatges.update(m => [...m, { rol: 'assistant', text: res.respuesta }]);
        this.scrollAlFinal();
        // 6. Fi de la càrrega
        this.carregant.set(false);
      },
      error: (err) => {
        const detall = err?.error?.detail ?? 'No he podido conectar con el asistente.';
        this.missatges.update(m => [...m, { rol: 'assistant', text: `⚠️ ${detall}` }]);
        this.carregant.set(false);
      },
    });
  }

  seleccionarImatge(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // reader dona "data:image/xxx;base64,XXXX"; el backend només vol la part base64
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      this.imatgeBase64.set(base64);
    };
    reader.readAsDataURL(file);

    // Permet tornar a triar el mateix fitxer després
    input.value = '';
  }

  onTancar(): void {
    this.tancar.emit();
  }
}
