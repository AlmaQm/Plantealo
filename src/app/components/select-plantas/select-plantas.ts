import {
  Component,
  computed,
  input,
  output,
  signal,
  ElementRef,
  inject,
  HostListener,
} from '@angular/core';

export interface SelectOpcion {
  valor: number;
  etiqueta: string;
}

@Component({
  selector: 'app-select-plantas',
  standalone: true,
  templateUrl: './select-plantas.html',
  styleUrls: ['./select-plantas.scss'],
})
export class SelectPlantasComponent {
  // --- API pública ---
  opciones = input<SelectOpcion[]>([]);
  value = input<number | null>(null);
  placeholder = input<string>('— Elige una planta —');
  valueChange = output<number>();

  private el = inject(ElementRef);

  abierto = signal(false);
  // 'abajo' (por defecto) | 'arriba' (si no cabe debajo del trigger)
  direccion = signal<'abajo' | 'arriba'>('abajo');

  // Alto máximo del panel (debe coincidir con max-height en el .scss)
  private static readonly PANEL_MAX_ALTO = 220;

  etiquetaActual = computed(() => {
    const v = this.value();
    if (v === null) return this.placeholder();
    const opcion = this.opciones().find((o) => o.valor === v);
    return opcion ? opcion.etiqueta : this.placeholder();
  });

  toggle(): void {
    const abriendo = !this.abierto();
    if (abriendo) this.calcularDireccion();
    this.abierto.set(abriendo);
  }

  cerrar(): void {
    this.abierto.set(false);
  }

  // Mide el espacio disponible arriba/abajo del trigger y decide hacia
  // dónde se despliega el panel para que no se salga del viewport.
  private calcularDireccion(): void {
    const trigger = this.el.nativeElement.querySelector('.sp__trigger') as HTMLElement | null;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const espacioAbajo = window.innerHeight - rect.bottom;
    const espacioArriba = rect.top;

    // Por defecto abajo; solo subimos si no cabe abajo pero sí (mejor) arriba.
    const cabeAbajo = espacioAbajo >= SelectPlantasComponent.PANEL_MAX_ALTO;
    this.direccion.set(
      !cabeAbajo && espacioArriba > espacioAbajo ? 'arriba' : 'abajo'
    );
  }

  seleccionar(opcion: SelectOpcion): void {
    this.valueChange.emit(opcion.valor);
    this.cerrar();
  }

  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent): void {
    if (this.abierto() && !this.el.nativeElement.contains(ev.target)) {
      this.cerrar();
    }
  }
}
