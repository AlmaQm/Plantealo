import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';


interface MenuOption {
  icon: string;
  title: string;
  subtitle: string;
  action: () => void;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.scss']
})
export class PerfilComponent {
  // Datos del usuario (fáciles de conectar a un Servicio/API después)
  user = {
    name: 'María García',
    handle: '@maria_huerto',
    preference: 'Vegetariano',
    stats: [
      { label: 'Plantas', value: 8 },
      { label: 'Listas', value: 2 },
      { label: 'Recetas', value: 6 }
    ]
  };

  // Array de opciones: escalabilidad pura
  menuOptions: MenuOption[] = [
    {
      icon: 'notifications',
      title: 'Notificaciones',
      subtitle: 'Gestiona tus alertas de riego y cosecha',
      action: () => console.log('Ir a notificaciones')
    },
    {
      icon: 'lock',
      title: 'Seguridad',
      subtitle: 'Cambiar contraseña y privacidad',
      action: () => console.log('Ir a seguridad')
    },
    {
      icon: 'settings',
      title: 'Configuración',
      subtitle: 'Ajustes generales de la aplicación',
      action: () => console.log('Ir a ajustes')
    }
  ];
}