import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface SobraCosechaDatos {
  cantidad_aprox?: string;
  ciudad?: string;
}

@Component({
  selector: 'app-sobra-cosecha-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sobra-cosecha-modal.html',
  styleUrls: ['./sobra-cosecha-modal.scss'],
})
export class SobraCosechaModalComponent {
  nombrePlanta = input.required<string>();
  necesitaCiudad = input<boolean>(false);
  ciudades = input<string[]>([]);
  publicando = input<boolean>(false);
  error = input<string>('');

  cerrar = output<void>();
  publicar = output<SobraCosechaDatos>();

  paso = signal<'preguntar' | 'formulario'>('preguntar');
  cantidad = signal('');
  ciudadSeleccionada = signal('');

  responderSi(): void {
    this.paso.set('formulario');
  }

  confirmarPublicar(): void {
    if (this.necesitaCiudad() && !this.ciudadSeleccionada()) return;
    this.publicar.emit({
      cantidad_aprox: this.cantidad().trim() || undefined,
      ciudad: this.necesitaCiudad() ? this.ciudadSeleccionada() : undefined,
    });
  }
}
