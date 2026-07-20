import { Component, effect, inject, input, output, signal, ViewChild, ElementRef, Injector, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { PlantasService } from '../../services/plantas';
import { environment } from '../../../environments/environment';

interface Missatge {
  rol: 'assistant' | 'user';
  text: string;
  imatges?: string[];  // base64 de les imatges adjuntes, si n'hi ha
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
  imatges = signal<string[]>([]);

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
    // Permet enviar si hi ha text O almenys una imatge
    if ((!text && !this.imatges().length) || this.carregant()) return;

    // Si només hi ha imatges sense text, usa un text per defecte
    const textFinal = text || '📷';

    // Captura les imatges abans de netejar el signal, perquè les necessitem
    // tant a la bombolla com al body de la petició.
    const imatges = this.imatges();

    // 1. Missatge de l'usuari
    this.missatges.update(m => [...m, {
      rol: 'user',
      text: textFinal,
      imatges
    }]);
    this.imatges.set([]);  // la preview desapareix immediatament
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
      imagen_base64: null,
      imagenes_base64: imatges,
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
    const files = input.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // reader dona "data:image/xxx;base64,XXXX"; el backend només vol la part base64
        const base64 = result.includes(',') ? result.split(',')[1] : result;
        this.imatges.update(arr => [...arr, base64]);
      };
      reader.readAsDataURL(file);
    });

    // Permet tornar a triar els mateixos fitxers després
    input.value = '';
  }

  eliminarImatge(index: number): void {
    this.imatges.update(arr => arr.filter((_, i) => i !== index));
  }

  onTancar(): void {
    this.tancar.emit();
  }
}
