import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import { Navbar } from './shared/components/navbar/navbar';
import { ChatComponent } from './components/chat/chat';
import { AuthService } from './services/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, Navbar, ChatComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  private readonly authService = inject(AuthService);

  // se mantiene suscrito durante toda la vida de la app para que el
  // usuario quede cacheado en localStorage nada más loguearse, sin
  // depender de visitar Perfil (única pantalla que lo consumía antes)
  private readonly currentUser = toSignal(this.authService.currentUser$, { initialValue: null });

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(e => e.urlAfterRedirects)
    ),
    { initialValue: '/' }
  );

  protected readonly isAuthRoute = computed(() => {
    const url = this.currentUrl();
    return url.startsWith('/login') || url.startsWith('/register');
  });

  protected readonly chatObert = signal(false);

  protected toggleChat(): void {
    this.chatObert.update(v => !v);
  }

  // Boton "Instalar app": Chrome dispara beforeinstallprompt cuando detecta
  // que la web es instalable (manifest + service worker); guardamos el
  // evento para poder lanzar el dialogo nativo desde un boton propio, ya
  // que el menu de tres puntos del navegador no es nada intuitivo.
  private deferredInstallPrompt: any = null;
  protected readonly instalable = signal(false);

  protected async instalarApp(): Promise<void> {
    if (!this.deferredInstallPrompt) return;
    this.deferredInstallPrompt.prompt();
    await this.deferredInstallPrompt.userChoice;
    this.deferredInstallPrompt = null;
    this.instalable.set(false);
  }

  constructor() {
    this.translate.addLangs(['es', 'ca', 'en']);
    this.translate.setFallbackLang('es');
    this.translate.use('es');

    const yaInstalada = window.matchMedia?.('(display-mode: standalone)').matches;
    if (!yaInstalada) {
      window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault();
        this.deferredInstallPrompt = event;
        this.instalable.set(true);
      });
      window.addEventListener('appinstalled', () => {
        this.deferredInstallPrompt = null;
        this.instalable.set(false);
      });
    }
  }
}
