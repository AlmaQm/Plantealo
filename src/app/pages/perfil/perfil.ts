import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../services/auth';
import { PlantasService, calcularEstado } from '../../services/plantas';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';
import { GuardadasTabsComponent } from '../../shared/components/guardadas-tabs/guardadas-tabs';

const DIETA_LABEL: Record<string, string> = {
  OMNIVORA:    'Omnívora',
  VEGETARIANA: 'Vegetariana',
  VEGANA:      'Vegana',
};

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, GuardadasTabsComponent],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.scss']
})
export class PerfilComponent {
  private readonly authService   = inject(AuthService);
  private readonly plantasService = inject(PlantasService);
  private readonly router = inject(Router);

  readonly usuario = toSignal(this.authService.currentUser$, {
    initialValue: this.authService.getStoredUser()
  });

  readonly totalPlantas = computed(() => this.plantasService.inventario().length);

  readonly plantasListas = computed(() =>
    this.plantasService.inventario().filter(p => calcularEstado(p) === 'LISTA').length
  );

  readonly plantasCreciendo = computed(() =>
    this.plantasService.inventario().filter(p => calcularEstado(p) === 'CRECIENDO').length
  );

  dietaLabel(tipo: string | undefined): string {
    return DIETA_LABEL[tipo ?? ''] ?? '';
  }

  iniciales(nombre: string | undefined): string {
    if (!nombre) return '?';
    const parts = nombre.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return nombre[0].toUpperCase();
  }

  logout(): void {
    this.authService.logout();
  }

  irAHistorialPlantas(): void {
    this.router.navigate(['/plantas-historial']);
  }
}
