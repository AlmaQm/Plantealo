import { Component, inject } from '@angular/core';
import { TitleCasePipe, UpperCasePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { Usuario } from '../../models/interfaces';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [TitleCasePipe, UpperCasePipe],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.scss']
})
export class Perfil {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly user = toSignal(this.authService.currentUser$);

  readonly dietaEmoji: Record<Usuario['tipo_dieta'], string> = {
    OMNIVORA:    '🥩',
    VEGETARIANA: '🥗',
    VEGANA:      '🌱',
  };

  async onLogout(): Promise<void> {
    await this.authService.logout();
  }
}
