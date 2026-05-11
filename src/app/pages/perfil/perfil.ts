import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';

interface MenuOption {
  icon: string;
  title: string;
  subtitle: string;
  key: string; // Para identificar la acción
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.scss']
})
export class PerfilComponent {
  private readonly authService = inject(AuthService);
  user = {
    name: 'María García',
    handle: '@maria_huerto',
    avatar: 'MG', // O un emoji como 👩‍🌾
    stats: [
      { label: 'Plantas', value: 8 },
      { label: 'Listas', value: 2 },
      { label: 'Recetas', value: 6 }
    ]
  };

  menuOptions: MenuOption[] = [
    {
      icon: 'notifications',
      title: 'Notificaciones',
      subtitle: 'Gestiona tus alertas de riego y cosecha',
      key: 'notifications'
    },
    {
      icon: 'lock',
      title: 'Seguridad',
      subtitle: 'Cambiar contraseña y privacidad',
      key: 'security'
    },
    {
      icon: 'settings',
      title: 'Configuración',
      subtitle: 'Ajustes generales de la aplicación',
      key: 'settings'
    }
  ];

  // Método funcional para manejar los clicks


  handleAction(key: string): void {
    if (key === 'logout') {
      this.authService.logout();
    }
  }
}