import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../services/auth';
import { Usuario } from '../../models/interfaces';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal';
import { SelectPlantasComponent, SelectOpcion } from '../../components/select-plantas/select-plantas';

type Idioma = 'ES' | 'CA' | 'EN';

type ConfiguracionForm = {
  nombre_usuario: FormControl<string>;
  tipo_dieta: FormControl<Usuario['tipo_dieta']>;
};

const DIETA_A_NUMERO: Record<Usuario['tipo_dieta'], number> = {
  OMNIVORA: 1,
  VEGETARIANA: 2,
  VEGANA: 3,
};

const NUMERO_A_DIETA: Record<number, Usuario['tipo_dieta']> = {
  1: 'OMNIVORA',
  2: 'VEGETARIANA',
  3: 'VEGANA',
};

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageHeaderComponent, ConfirmModalComponent, SelectPlantasComponent],
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
  readonly mostrarPremiumModal = signal(false);

  readonly avatarPreview = signal('');
  readonly archivoSeleccionadoNombre = signal('');
  private avatarFile: File | undefined;

  readonly dietaOpcionesSelect: SelectOpcion[] = [
    { valor: 1, etiqueta: 'Omnívora' },
    { valor: 2, etiqueta: 'Vegetariana' },
    { valor: 3, etiqueta: 'Vegana' },
  ];

  readonly dietaValorSeleccionado = signal<number | null>(null);

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
      this.avatarPreview.set(usuario.imagen_url ?? '');
      this.dietaValorSeleccionado.set(DIETA_A_NUMERO[usuario.tipo_dieta]);
    }
  }

  onDietaChange(valor: number): void {
    const dieta = NUMERO_A_DIETA[valor];
    this.form.controls.tipo_dieta.setValue(dieta);
    this.dietaValorSeleccionado.set(valor);
  }

  seleccionarIdioma(idioma: Idioma): void {
    if (idioma !== 'ES') {
      this.mostrarPremiumModal.set(true);
      return;
    }
    this.idioma.set(idioma);
  }

  cerrarPremiumModal(): void {
    this.mostrarPremiumModal.set(false);
  }

  onAvatarSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.avatarFile = file;
      this.avatarPreview.set(URL.createObjectURL(file));
      this.archivoSeleccionadoNombre.set(file.name);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid || this.guardando()) return;
    this.guardando.set(true);
    this.error.set('');
    this.guardadoOk.set(false);

    try {
      let imagenUrl: string | undefined;
      if (this.avatarFile) {
        const uid = this.usuario()?.uid;
        if (!uid) throw new Error('No se pudo verificar la sesión actual.');
        imagenUrl = await this.authService.uploadAvatar(this.avatarFile, uid);
      }

      const ok = await this.authService.actualizarPerfil({
        ...this.form.getRawValue(),
        ...(imagenUrl ? { imagen_url: imagenUrl } : {})
      });

      if (ok) {
        this.guardadoOk.set(true);
        this.avatarFile = undefined;
      } else {
        this.error.set('No se pudo guardar. Inténtalo de nuevo.');
      }
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'No se pudo guardar. Inténtalo de nuevo.');
    } finally {
      this.guardando.set(false);
    }
  }
}
