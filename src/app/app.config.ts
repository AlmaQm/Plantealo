import { ApplicationConfig, importProvidersFrom } from '@angular/core'; // 👈 Añadido importProvidersFrom
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import { provideTranslateService } from "@ngx-translate/core";
import { provideTranslateHttpLoader } from "@ngx-translate/http-loader";
import { provideHttpClient, withFetch } from "@angular/common/http"; // 👈 Añadido withFetch
import { IonicModule } from '@ionic/angular'; // 👈 Añadido

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // 1. Añadimos el soporte global de Ionic para que el ModalController funcione
    importProvidersFrom(IonicModule.forRoot({})), 
    
    // 2. Mejoramos el HttpClient con withFetch para evitar el aviso de la consola
    provideHttpClient(withFetch()), 
    
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: '/assets/i18n/',
        suffix: '.json'
      }),
      fallbackLang: 'es',
      lang: 'es'
    })
  ],
};

