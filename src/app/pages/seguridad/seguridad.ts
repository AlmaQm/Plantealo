import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { AuthService } from '../../services/auth';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal';

export function nuevaPasswordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const passwordNueva = control.get('passwordNueva')?.value as string;
  const confirmar = control.get('confirmarPasswordNueva')?.value as string;
  return passwordNueva === confirmar ? null : { passwordsMismatch: true };
}

type CambiarPasswordForm = {
  passwordActual: FormControl<string>;
  passwordNueva: FormControl<string>;
  confirmarPasswordNueva: FormControl<string>;
};

const TEXTO_CONFIRMACION = 'ELIMINAR';

@Component({
  selector: 'app-seguridad',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PageHeaderComponent, ConfirmModalComponent],
  templateUrl: './seguridad.html',
  styleUrls: ['./seguridad.scss']
})
export class SeguridadComponent {
  private readonly authService = inject(AuthService);

  // --- Cambiar contraseña ---
  readonly guardandoPassword = signal(false);
  readonly passwordOk = signal(false);
  readonly passwordError = signal('');

  readonly passwordForm = new FormGroup<CambiarPasswordForm>(
    {
      passwordActual: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required]
      }),
      passwordNueva: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(6)]
      }),
      confirmarPasswordNueva: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required]
      }),
    },
    { validators: nuevaPasswordsMatchValidator }
  );

  async onSubmitPassword(): Promise<void> {
    if (this.passwordForm.invalid || this.guardandoPassword()) return;
    this.guardandoPassword.set(true);
    this.passwordError.set('');
    this.passwordOk.set(false);

    const { passwordActual, passwordNueva } = this.passwordForm.getRawValue();

    try {
      await this.authService.cambiarPassword(passwordActual, passwordNueva);
      this.passwordOk.set(true);
      this.passwordForm.reset();
    } catch (e) {
      this.passwordError.set((e as Error).message);
    } finally {
      this.guardandoPassword.set(false);
    }
  }

  // --- Eliminar cuenta ---
  readonly passwordEliminar = signal('');
  readonly textoConfirmacion = signal('');
  readonly mostrarConfirmModal = signal(false);
  readonly eliminando = signal(false);
  readonly eliminarError = signal('');

  get puedeEliminar(): boolean {
    return this.passwordEliminar().trim().length > 0
      && this.textoConfirmacion() === TEXTO_CONFIRMACION;
  }

  abrirConfirmModal(): void {
    if (!this.puedeEliminar) return;
    this.eliminarError.set('');
    this.mostrarConfirmModal.set(true);
  }

  cancelarEliminar(): void {
    this.mostrarConfirmModal.set(false);
  }

  async confirmarEliminar(): Promise<void> {
    this.mostrarConfirmModal.set(false);
    this.eliminando.set(true);
    this.eliminarError.set('');

    try {
      await this.authService.eliminarCuenta(this.passwordEliminar());
      // eliminarCuenta() ya redirige a /login en caso de éxito.
    } catch (e) {
      this.eliminarError.set((e as Error).message);
      this.eliminando.set(false);
    }
  }
}
