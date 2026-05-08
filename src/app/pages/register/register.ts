import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';
import { Usuario } from '../../models/interfaces';

export function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('contrasena')?.value as string;
  const confirm = control.get('confirmarContrasena')?.value as string;
  return password === confirm ? null : { passwordsMismatch: true };
}

type TipoDieta = Usuario['tipo_dieta'];

type RegisterForm = {
  nombre: FormControl<string>;
  nombre_usuario: FormControl<string>;
  email: FormControl<string>;
  contrasena: FormControl<string>;
  confirmarContrasena: FormControl<string>;
  tipo_dieta: FormControl<TipoDieta>;
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class Register {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly avatarPreview = signal('');
  private avatarFile: File | undefined;

  readonly dietaOpciones: { valor: TipoDieta; emoji: string; label: string }[] = [
    { valor: 'OMNIVORA',    emoji: '🥩', label: 'Omnívora' },
    { valor: 'VEGETARIANA', emoji: '🥗', label: 'Vegetariana' },
    { valor: 'VEGANA',      emoji: '🌱', label: 'Vegana' },
  ];

  readonly form = new FormGroup<RegisterForm>(
    {
      nombre: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required]
      }),
      nombre_usuario: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern('^[a-zA-Z0-9_]+$')]
      }),
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email]
      }),
      contrasena: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(6)]
      }),
      confirmarContrasena: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required]
      }),
      tipo_dieta: new FormControl<TipoDieta>('OMNIVORA', {
        nonNullable: true,
        validators: [Validators.required]
      }),
    },
    { validators: passwordsMatchValidator }
  );

  onAvatarSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.avatarFile = file;
      this.avatarPreview.set(URL.createObjectURL(file));
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    this.error.set('');

    const { nombre, nombre_usuario, email, contrasena, tipo_dieta } = this.form.getRawValue();
    const data: Omit<Usuario, 'uid' | 'fechaRegistro'> = {
      nombre,
      nombre_usuario,
      email,
      tipo_dieta,
    };

    try {
      await this.authService.register(data, contrasena, this.avatarFile);
      await this.router.navigate(['/inicio']);
    } catch (e) {
      this.error.set((e as Error).message);
    } finally {
      this.loading.set(false);
    }
  }
}
