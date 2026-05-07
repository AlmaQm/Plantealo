import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Navbar } from './shared/navbar/navbar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('PlantealoApp');
  // translate: any;

    private translate = inject(TranslateService);

    textoParaTraducir = 'Hola Mundo';

    constructor() {
        this.translate.addLangs(['es', 'ca','en']);
        this.translate.setFallbackLang('es');
        this.translate.use('en');
    }
}
