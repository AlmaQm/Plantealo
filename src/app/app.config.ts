import { ApplicationConfig, importProvidersFrom, isDevMode } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';

import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { IonicModule } from '@ionic/angular';

import { getApp, initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager,
  provideFirestore,
} from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';

import { environment } from '../environments/environment';
import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
    importProvidersFrom(IonicModule.forRoot({})),
    provideHttpClient(withFetch()),
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: '/assets/i18n/',
        suffix: '.json',
      }),
      fallbackLang: 'es',
      lang: 'es',
    }),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() =>
      initializeFirestore(getApp(), {
        localCache: persistentLocalCache({ tabManager: persistentSingleTabManager({}) }),
      }),
    ),
    provideStorage(() => getStorage()),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
