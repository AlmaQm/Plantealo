import { Component, computed, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectPlantasComponent, SelectOpcion } from '../../../components/select-plantas/select-plantas';

export interface SobraCosechaDatos {
  cantidad_aprox?: string;
  ciudad: string;
}

@Component({
  selector: 'app-sobra-cosecha-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectPlantasComponent],
  templateUrl: './sobra-cosecha-modal.html',
  styleUrls: ['./sobra-cosecha-modal.scss'],
})
export class SobraCosechaModalComponent {
  nombrePlanta = input.required<string>();
  ciudades = input<string[]>([]);
  publicando = input<boolean>(false);
  error = input<string>('');

  cerrar = output<void>();
  publicar = output<SobraCosechaDatos>();

  paso = signal<'preguntar' | 'formulario'>('preguntar');
  cantidad = signal('');
  // Siempre arranca vacío (sin recordar la ciudad de la vez anterior): se
  // muestra el placeholder "Selecciona tu ciudad" hasta que el usuario elige.
  ciudadSeleccionada = signal('');
  avisoCiudad = signal(false);

  // Mismo componente reutilizable que "Añadir planta": es numérico, así que
  // la ciudad (string) se mapea a su índice dentro de ciudades().
  readonly opcionesCiudad = computed<SelectOpcion[]>(() =>
    this.ciudades().map((c, i) => ({ valor: i, etiqueta: c }))
  );

  readonly ciudadIndice = computed<number>(() => this.ciudades().indexOf(this.ciudadSeleccionada()));

  onCiudadIndiceChange(indice: number | string): void {
    this.ciudadSeleccionada.set(this.ciudades()[Number(indice)] ?? '');
    this.avisoCiudad.set(false);
  }

  responderSi(): void {
    this.paso.set('formulario');
  }

  confirmarPublicar(): void {
    if (!this.ciudadSeleccionada()) {
      this.avisoCiudad.set(true);
      return;
    }
    this.avisoCiudad.set(false);
    this.publicar.emit({
      cantidad_aprox: this.cantidad().trim() || undefined,
      ciudad: this.ciudadSeleccionada(),
    });
  }
}
