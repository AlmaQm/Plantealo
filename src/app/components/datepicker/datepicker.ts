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

interface DiaCelda {
  fecha: Date;
  dia: number;
  otroMes: boolean;
  esHoy: boolean;
  seleccionado: boolean;
  deshabilitado: boolean;
}

@Component({
  selector: 'app-datepicker',
  standalone: true,
  templateUrl: './datepicker.html',
  styleUrls: ['./datepicker.scss'],
})
export class DatepickerComponent {
  // --- API pública (se usa desde el componente padre) ---
  value = input<string>('');          // fecha seleccionada 'YYYY-MM-DD'
  max = input<string | null>(null);   // fecha máxima seleccionable 'YYYY-MM-DD'
  valueChange = output<string>();      // emite la fecha elegida 'YYYY-MM-DD'

  private el = inject(ElementRef);

  abierto = signal(false);
  mesVisible = signal<Date>(this.mesInicial());

  readonly diasSemana = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  // Texto del botón que abre el calendario
  etiqueta = computed(() => {
    const v = this.value();
    return v ? this.formatoBonito(this.fromISO(v)) : 'Elige una fecha';
  });

  // "Junio 2026"
  etiquetaMes = computed(() => {
    const d = this.mesVisible();
    const s = d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    return s.charAt(0).toUpperCase() + s.slice(1);
  });

  // Las 42 celdas (6 semanas) del mes visible
  dias = computed<DiaCelda[]>(() => {
    const base = this.mesVisible();
    const year = base.getFullYear();
    const month = base.getMonth();

    const primero = new Date(year, month, 1);
    const offset = (primero.getDay() + 6) % 7; // semana empieza en lunes
    const inicio = new Date(year, month, 1 - offset);

    const sel = this.value() ? this.fromISO(this.value()) : null;
    const maxF = this.max() ? this.fromISO(this.max()!) : null;
    const hoy = this.hoy();

    const celdas: DiaCelda[] = [];
    for (let i = 0; i < 42; i++) {
      const f = new Date(inicio);
      f.setDate(inicio.getDate() + i);
      celdas.push({
        fecha: f,
        dia: f.getDate(),
        otroMes: f.getMonth() !== month,
        esHoy: this.mismoDia(f, hoy),
        seleccionado: sel ? this.mismoDia(f, sel) : false,
        deshabilitado: maxF ? f > maxF : false,
      });
    }
    return celdas;
  });

  toggle(): void {
    this.abierto.update((v) => !v);
    if (this.abierto()) this.sincronizarMes();
  }

  cerrar(): void {
    this.abierto.set(false);
  }

  mesAnterior(): void {
    const d = this.mesVisible();
    this.mesVisible.set(new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  mesSiguiente(): void {
    const d = this.mesVisible();
    this.mesVisible.set(new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  seleccionar(celda: DiaCelda): void {
    if (celda.deshabilitado) return;
    this.valueChange.emit(this.toISO(celda.fecha));
    if (celda.otroMes) {
      this.mesVisible.set(
        new Date(celda.fecha.getFullYear(), celda.fecha.getMonth(), 1)
      );
    }
    this.cerrar();
  }

  irHoy(): void {
    const hoy = this.hoy();
    const maxF = this.max() ? this.fromISO(this.max()!) : null;
    if (maxF && hoy > maxF) return; // hoy no debería pasar del max, pero por si acaso
    this.valueChange.emit(this.toISO(hoy));
    this.mesVisible.set(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
    this.cerrar();
  }

  limpiar(): void {
    this.valueChange.emit('');
  }

  // Cierra el calendario si haces clic fuera del componente
  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent): void {
    if (this.abierto() && !this.el.nativeElement.contains(ev.target)) {
      this.cerrar();
    }
  }

  // Al abrir, posiciona el calendario en el mes de la fecha elegida (o el actual)
  private sincronizarMes(): void {
    const v = this.value();
    const ref = v ? this.fromISO(v) : this.hoy();
    this.mesVisible.set(new Date(ref.getFullYear(), ref.getMonth(), 1));
  }

  private mesInicial(): Date {
    const hoy = new Date();
    return new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  }

  private hoy(): Date {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private mismoDia(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  // Date -> 'YYYY-MM-DD' en hora local (evita el desfase de zona horaria de toISOString)
  private toISO(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  // 'YYYY-MM-DD' -> Date en hora local
  private fromISO(s: string): Date {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  private formatoBonito(d: Date): string {
    return d.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }
}
