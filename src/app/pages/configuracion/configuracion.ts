import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../services/auth';
import { Usuario } from '../../models/interfaces';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';

type Idioma = 'ES' | 'CA' | 'EN';

type ConfiguracionForm = {
  nombre_usuario: FormControl<string>;
  tipo_dieta: FormControl<Usuario['tipo_dieta']>;
};

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageHeaderComponent],
  templateUrl: './configuracion.html',
  styleUrls: ['./configuracion.scss']
})
export class ConfiguracionComponent implements OnInit {
  private readonly authService = inject(AuthService);

  readonly usuario = toSignal(this.authService.currentUser$, {
    initialValue: this.authService.getStoredUser()
  });

  readonly idioma = signal<Idioma>('ES');
  readonly guardando = signal(false);
  readonly guardadoOk = signal(false);
  readonly error = signal('');

  readonly dietaOpciones: { valor: Usuario['tipo_dieta']; label: string }[] = [
    { valor: 'OMNIVORA',    label: 'Omnívora' },
    { valor: 'VEGETARIANA', label: 'Vegetariana' },
    { valor: 'VEGANA',      label: 'Vegana' },
  ];

  readonly form = new FormGroup<ConfiguracionForm>({
    nombre_usuario: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)]
    }),
    tipo_dieta: new FormControl<Usuario['tipo_dieta']>('OMNIVORA', {
      nonNullable: true,
      validators: [Validators.required]
    }),
  });

  ngOnInit(): void {
    const usuario = this.usuario();
    if (usuario) {
      this.form.patchValue({
        nombre_usuario: usuario.nombre_usuario,
        tipo_dieta: usuario.tipo_dieta
      });
    }
  }

  seleccionarIdioma(idioma: Idioma): void {
    this.idioma.set(idioma);
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid || this.guardando()) return;
    this.guardando.set(true);
    this.error.set('');
    this.guardadoOk.set(false);

    try {
      const ok = await this.authService.actualizarPerfil(this.form.getRawValue());
      if (ok) {
        this.guardadoOk.set(true);
      } else {
        this.error.set('No se pudo guardar. Inténtalo de nuevo.');
      }
    } catch {
      this.error.set('No se pudo guardar. Inténtalo de nuevo.');
    } finally {
      this.guardando.set(false);
    }
  }
}
