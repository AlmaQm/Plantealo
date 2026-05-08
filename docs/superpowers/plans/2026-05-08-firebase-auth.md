# Firebase Authentication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add full Firebase Auth (email/password) + Firestore user storage + Storage avatar upload to PlantealoApp, with login/register pages, auth guards, and a real profile page.

**Architecture:** Infra-first (environments → providers → service → guards → routes → pages). Each layer is verifiable before building the next. Firebase Auth state drives an `Observable<Usuario | null>` in AuthService; guards tap that stream with `take(1)`.

**Tech Stack:** Angular 21 (standalone), @angular/fire 20.0.1, Firebase 10+, TypedForms (reactive forms), SCSS with existing `$variables`.

---

## File Map

```
NEW
src/environments/environment.ts              dev Firebase config
src/environments/environment.prod.ts         prod Firebase config
src/app/guards/auth.guard.ts                 authGuard + guestGuard
src/app/services/auth.ts                     AuthService
src/app/pages/login/login.ts                 Login component
src/app/pages/login/login.html
src/app/pages/login/login.scss
src/app/pages/register/register.ts          Register component
src/app/pages/register/register.html
src/app/pages/register/register.scss

MODIFIED
angular.json                                 add fileReplacements for prod
src/app/models/interfaces.ts                 replace Usuario interface
src/app/app.config.ts                        add Firebase providers
src/app/app.routes.ts                        guards + login/register routes
src/app/app.ts                               isAuthRoute computed signal
src/app/app.html                             hide navbar on auth routes
src/app/pages/perfil/perfil.ts              read currentUser$ + logout
src/app/pages/perfil/perfil.html
src/app/pages/perfil/perfil.scss
```

---

## Task 1 — Environment files & angular.json

**Files:**
- Create: `src/environments/environment.ts`
- Create: `src/environments/environment.prod.ts`
- Modify: `angular.json` (add `fileReplacements` in production config)

- [ ] **Step 1.1 — Create `src/environments/environment.ts`**

```typescript
export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: 'AIzaSyBJWkIyKjDGX67PQdkmpVnJIjzUYqalFsg',
    authDomain: 'plantealo.firebaseapp.com',
    projectId: 'plantealo',
    storageBucket: 'plantealo.firebasestorage.app',
    messagingSenderId: '480654127817',
    appId: '1:480654127817:web:4f846c47d28bb079271318',
    measurementId: 'G-TZN0FY3KNG'
  }
};
```

- [ ] **Step 1.2 — Create `src/environments/environment.prod.ts`**

```typescript
export const environment = {
  production: true,
  firebaseConfig: {
    apiKey: 'AIzaSyBJWkIyKjDGX67PQdkmpVnJIjzUYqalFsg',
    authDomain: 'plantealo.firebaseapp.com',
    projectId: 'plantealo',
    storageBucket: 'plantealo.firebasestorage.app',
    messagingSenderId: '480654127817',
    appId: '1:480654127817:web:4f846c47d28bb079271318',
    measurementId: 'G-TZN0FY3KNG'
  }
};
```

- [ ] **Step 1.3 — Add `fileReplacements` to `angular.json`**

In `angular.json`, inside `"configurations" > "production"`, add `fileReplacements` alongside the existing `budgets` and `outputHashing`:

```json
"production": {
  "fileReplacements": [
    {
      "replace": "src/environments/environment.ts",
      "with": "src/environments/environment.prod.ts"
    }
  ],
  "budgets": [
    { "type": "initial", "maximumWarning": "500kB", "maximumError": "1MB" },
    { "type": "anyComponentStyle", "maximumWarning": "4kB", "maximumError": "8kB" }
  ],
  "outputHashing": "all"
}
```

- [ ] **Step 1.4 — Verify build compiles**

```bash
npx ng build --configuration development
```

Expected: no errors. If TypeScript complains about the environments path, add `"src/environments/environment.ts"` to `tsconfig.app.json` → `"include"`.

- [ ] **Step 1.5 — Commit**

```bash
git add src/environments/ angular.json
git commit -m "feat: add Firebase environment config files"
```

---

## Task 2 — Replace `Usuario` in `interfaces.ts`

**Files:**
- Modify: `src/app/models/interfaces.ts`

- [ ] **Step 2.1 — Replace `Usuario` interface**

Open `src/app/models/interfaces.ts`. Replace the existing `Usuario` interface (lines 37-43):

```typescript
// REMOVE this:
export interface Usuario {
  usuario_id: string;
  nombre: string;
  email: string;
  tipo_dieta: 'VEGANA' | 'VEGETARIANA' | 'OMNIVORA';
  recetasGuardadasIds: string[];
}

// ADD this:
export interface Usuario {
  uid: string;
  nombre: string;
  nombre_usuario: string;
  email: string;
  tipo_dieta: 'OMNIVORA' | 'VEGETARIANA' | 'VEGANA';
  imagen_url?: string;
  fechaRegistro?: Date;
}
```

- [ ] **Step 2.2 — Check for broken references**

Run:
```bash
npx ng build --configuration development 2>&1 | grep -i "error"
```

The old interface had `usuario_id` and `recetasGuardadasIds`. If any file references them, TypeScript will error. Fix by removing the reference (the old fields are not used in any page at this stage).

- [ ] **Step 2.3 — Commit**

```bash
git add src/app/models/interfaces.ts
git commit -m "feat: update Usuario interface for Firebase auth"
```

---

## Task 3 — Firebase providers in `app.config.ts`

**Files:**
- Modify: `src/app/app.config.ts`

- [ ] **Step 3.1 — Rewrite `app.config.ts` with Firebase providers**

Full replacement of `src/app/app.config.ts`:

```typescript
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { IonicModule } from '@ionic/angular';

import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';

import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom(IonicModule.forRoot({})),
    provideHttpClient(withFetch()),
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: '/assets/i18n/',
        suffix: '.json'
      }),
      fallbackLang: 'es',
      lang: 'es'
    }),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
  ],
};
```

- [ ] **Step 3.2 — Verify build**

```bash
npx ng build --configuration development 2>&1 | grep -i "error"
```

Expected: clean build. If `@angular/fire/app` is not found, run `npm install @angular/fire firebase` first.

- [ ] **Step 3.3 — Commit**

```bash
git add src/app/app.config.ts
git commit -m "feat: add Firebase providers to app config"
```

---

## Task 4 — AuthService

**Files:**
- Create: `src/app/services/auth.ts`

- [ ] **Step 4.1 — Write the error-mapping helper test**

Create `src/app/services/auth.spec.ts`:

```typescript
import { mapAuthError } from './auth';

describe('mapAuthError', () => {
  it('maps email-already-in-use', () => {
    expect(mapAuthError({ code: 'auth/email-already-in-use' }))
      .toBe('Este email ya está registrado');
  });

  it('maps invalid-credential', () => {
    expect(mapAuthError({ code: 'auth/invalid-credential' }))
      .toBe('Email o contraseña incorrectos');
  });

  it('maps user-not-found', () => {
    expect(mapAuthError({ code: 'auth/user-not-found' }))
      .toBe('Email o contraseña incorrectos');
  });

  it('maps weak-password', () => {
    expect(mapAuthError({ code: 'auth/weak-password' }))
      .toBe('La contraseña debe tener al menos 6 caracteres');
  });

  it('returns default for unknown code', () => {
    expect(mapAuthError({ code: 'auth/unknown' }))
      .toBe('Ha ocurrido un error. Inténtalo de nuevo');
  });
});
```

- [ ] **Step 4.2 — Run test — expect FAIL (function not defined yet)**

```bash
npx ng test --include="**/services/auth.spec.ts" --watch=false
```

Expected: `Error: mapAuthError is not a function` or similar compile error.

- [ ] **Step 4.3 — Create `src/app/services/auth.ts`**

```typescript
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, from, switchMap, map } from 'rxjs';

import { Auth, authState } from '@angular/fire/auth';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  browserLocalPersistence,
  setPersistence,
} from 'firebase/auth';

import { Firestore, doc } from '@angular/fire/firestore';
import { setDoc, getDoc } from 'firebase/firestore';

import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';

import { Usuario } from '../models/interfaces';

export function mapAuthError(error: { code?: string }): string {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'Este email ya está registrado';
    case 'auth/user-not-found':
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'Email o contraseña incorrectos';
    case 'auth/weak-password':
      return 'La contraseña debe tener al menos 6 caracteres';
    default:
      return 'Ha ocurrido un error. Inténtalo de nuevo';
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly auth = inject(Auth);
  private readonly firestore = inject(Firestore);
  private readonly storage = inject(Storage);
  private readonly router = inject(Router);

  readonly currentUser$: Observable<Usuario | null> = authState(this.auth).pipe(
    switchMap(user => {
      if (!user) return of(null);
      const docRef = doc(this.firestore, `usuarios/${user.uid}`);
      return from(getDoc(docRef)).pipe(
        map(snap => (snap.exists() ? (snap.data() as Usuario) : null))
      );
    })
  );

  constructor() {
    if (typeof window !== 'undefined') {
      setPersistence(this.auth, browserLocalPersistence).catch(() => {});
    }
  }

  async login(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
    } catch (error) {
      throw new Error(mapAuthError(error as { code?: string }));
    }
  }

  async register(
    data: Omit<Usuario, 'uid' | 'fechaRegistro'>,
    password: string,
    avatarFile?: File
  ): Promise<void> {
    try {
      const credential = await createUserWithEmailAndPassword(
        this.auth,
        data.email,
        password
      );
      const uid = credential.user.uid;

      let imagen_url: string | undefined = data.imagen_url;
      if (avatarFile) {
        imagen_url = await this.uploadAvatar(avatarFile, uid);
      }

      const usuario: Usuario = {
        uid,
        nombre: data.nombre,
        nombre_usuario: data.nombre_usuario,
        email: data.email,
        tipo_dieta: data.tipo_dieta,
        ...(imagen_url ? { imagen_url } : {}),
        fechaRegistro: new Date(),
      };

      await setDoc(doc(this.firestore, `usuarios/${uid}`), usuario);
    } catch (error) {
      throw new Error(mapAuthError(error as { code?: string }));
    }
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    await this.router.navigate(['/login']);
  }

  async uploadAvatar(file: File, uid: string): Promise<string> {
    const storageRef = ref(this.storage, `avatares/${uid}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  }
}
```

- [ ] **Step 4.4 — Run tests — expect PASS**

```bash
npx ng test --include="**/services/auth.spec.ts" --watch=false
```

Expected: 5 passing.

- [ ] **Step 4.5 — Build check**

```bash
npx ng build --configuration development 2>&1 | grep -i "error"
```

- [ ] **Step 4.6 — Commit**

```bash
git add src/app/services/auth.ts src/app/services/auth.spec.ts
git commit -m "feat: add AuthService with login, register, logout"
```

---

## Task 5 — Auth Guards

**Files:**
- Create: `src/app/guards/auth.guard.ts`

- [ ] **Step 5.1 — Write guard tests**

Create `src/app/guards/auth.guard.spec.ts`:

```typescript
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { authGuard, guestGuard } from './auth.guard';
import { AuthService } from '../services/auth';
import { Usuario } from '../models/interfaces';

const mockUser: Usuario = {
  uid: '123',
  nombre: 'Test',
  nombre_usuario: 'test_user',
  email: 'test@test.com',
  tipo_dieta: 'OMNIVORA',
};

function runGuard(
  guard: typeof authGuard | typeof guestGuard,
  user: Usuario | null
) {
  const authService = { currentUser$: of(user) } as unknown as AuthService;
  const router = { createUrlTree: (commands: string[]) => commands } as unknown as Router;
  TestBed.configureTestingModule({
    providers: [
      { provide: AuthService, useValue: authService },
      { provide: Router, useValue: router },
    ],
  });
  return TestBed.runInInjectionContext(() =>
    guard({} as never, {} as never)
  );
}

describe('authGuard', () => {
  it('allows access when user is logged in', done => {
    const result$ = runGuard(authGuard, mockUser) as ReturnType<typeof of>;
    (result$ as ReturnType<typeof of>).subscribe((v: unknown) => {
      expect(v).toBe(true);
      done();
    });
  });

  it('redirects to /login when user is null', done => {
    const result$ = runGuard(authGuard, null) as ReturnType<typeof of>;
    (result$ as ReturnType<typeof of>).subscribe((v: unknown) => {
      expect(v).toEqual(['/login']);
      done();
    });
  });
});

describe('guestGuard', () => {
  it('allows access when user is null', done => {
    const result$ = runGuard(guestGuard, null) as ReturnType<typeof of>;
    (result$ as ReturnType<typeof of>).subscribe((v: unknown) => {
      expect(v).toBe(true);
      done();
    });
  });

  it('redirects to /inicio when user is logged in', done => {
    const result$ = runGuard(guestGuard, mockUser) as ReturnType<typeof of>;
    (result$ as ReturnType<typeof of>).subscribe((v: unknown) => {
      expect(v).toEqual(['/inicio']);
      done();
    });
  });
});
```

- [ ] **Step 5.2 — Run tests — expect FAIL**

```bash
npx ng test --include="**/guards/auth.guard.spec.ts" --watch=false
```

Expected: compile error — `auth.guard` not found.

- [ ] **Step 5.3 — Create `src/app/guards/auth.guard.ts`**

```typescript
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.currentUser$.pipe(
    take(1),
    map(user => (user !== null ? true : router.createUrlTree(['/login'])))
  );
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.currentUser$.pipe(
    take(1),
    map(user => (user === null ? true : router.createUrlTree(['/inicio'])))
  );
};
```

- [ ] **Step 5.4 — Run tests — expect PASS**

```bash
npx ng test --include="**/guards/auth.guard.spec.ts" --watch=false
```

Expected: 4 passing.

- [ ] **Step 5.5 — Commit**

```bash
git add src/app/guards/auth.guard.ts src/app/guards/auth.guard.spec.ts
git commit -m "feat: add authGuard and guestGuard"
```

---

## Task 6 — Routes + App component

**Files:**
- Modify: `src/app/app.routes.ts`
- Modify: `src/app/app.ts`
- Modify: `src/app/app.html`

- [ ] **Step 6.1 — Rewrite `src/app/app.routes.ts`**

```typescript
import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'inicio',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.Login),
    canActivate: [guestGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register').then(m => m.Register),
    canActivate: [guestGuard]
  },
  {
    path: 'inicio',
    loadComponent: () => import('./pages/home/home').then(m => m.Home),
    canActivate: [authGuard]
  },
  {
    path: 'plantas',
    loadComponent: () => import('./pages/plantas/plantas').then(m => m.PlantasComponent),
    canActivate: [authGuard]
  },
  {
    path: 'recetas',
    loadComponent: () => import('./pages/recetas/recetas').then(m => m.RecetasComponent),
    canActivate: [authGuard]
  },
  {
    path: 'comunidad',
    loadComponent: () => import('./pages/comunidad/comunidad').then(m => m.Comunidad),
    canActivate: [authGuard]
  },
  {
    path: 'perfil',
    loadComponent: () => import('./pages/perfil/perfil').then(m => m.Perfil),
    canActivate: [authGuard]
  }
];
```

- [ ] **Step 6.2 — Rewrite `src/app/app.ts`**

```typescript
import { Component, computed, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import { Navbar } from './shared/components/navbar/navbar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

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

  constructor() {
    this.translate.addLangs(['es', 'ca', 'en']);
    this.translate.setFallbackLang('es');
    this.translate.use('en');
  }
}
```

- [ ] **Step 6.3 — Rewrite `src/app/app.html`**

```html
<router-outlet></router-outlet>
@if (!isAuthRoute()) {
  <app-navbar></app-navbar>
}
```

- [ ] **Step 6.4 — Build check**

```bash
npx ng build --configuration development 2>&1 | grep -i "error"
```

Expected: clean build. The `login` and `register` lazy imports will warn until the page files exist — create empty placeholder files if needed:

```bash
mkdir -p src/app/pages/login src/app/pages/register
```

Create minimal placeholder `src/app/pages/login/login.ts`:
```typescript
import { Component } from '@angular/core';
@Component({ selector: 'app-login', template: '<p>login</p>', standalone: true })
export class Login {}
```

Create minimal placeholder `src/app/pages/register/register.ts`:
```typescript
import { Component } from '@angular/core';
@Component({ selector: 'app-register', template: '<p>register</p>', standalone: true })
export class Register {}
```

- [ ] **Step 6.5 — Commit**

```bash
git add src/app/app.routes.ts src/app/app.ts src/app/app.html src/app/pages/login/ src/app/pages/register/
git commit -m "feat: add auth routes, guards, and conditional navbar"
```

---

## Task 7 — Login page

**Files:**
- Modify: `src/app/pages/login/login.ts` (replace placeholder)
- Create: `src/app/pages/login/login.html`
- Create: `src/app/pages/login/login.scss`

- [ ] **Step 7.1 — Rewrite `src/app/pages/login/login.ts`**

```typescript
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

type LoginForm = {
  email: FormControl<string>;
  password: FormControl<string>;
};

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal('');

  readonly form = new FormGroup<LoginForm>({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email]
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)]
    })
  });

  async onSubmit(): Promise<void> {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    this.error.set('');
    try {
      await this.authService.login(
        this.form.controls.email.value,
        this.form.controls.password.value
      );
      await this.router.navigate(['/inicio']);
    } catch (e) {
      this.error.set((e as Error).message);
    } finally {
      this.loading.set(false);
    }
  }
}
```

- [ ] **Step 7.2 — Create `src/app/pages/login/login.html`**

```html
<div class="auth-page">
  <div class="auth-logo">🌱 PlantealoApp</div>

  <div class="auth-card">
    <form [formGroup]="form" (ngSubmit)="onSubmit()">

      <label class="campo-label" for="email">Email</label>
      <input
        id="email"
        type="email"
        class="campo-input"
        [class.campo-input--error]="form.controls.email.invalid && form.controls.email.touched"
        formControlName="email"
        placeholder="tu@email.com"
        autocomplete="email">
      @if (form.controls.email.touched && form.controls.email.hasError('required')) {
        <p class="error-inline">El email es obligatorio</p>
      }
      @if (form.controls.email.touched && form.controls.email.hasError('email')) {
        <p class="error-inline">Introduce un email válido</p>
      }

      <label class="campo-label campo-label--mt" for="password">Contraseña</label>
      <input
        id="password"
        type="password"
        class="campo-input"
        [class.campo-input--error]="form.controls.password.invalid && form.controls.password.touched"
        formControlName="password"
        placeholder="••••••"
        autocomplete="current-password">
      @if (form.controls.password.touched && form.controls.password.hasError('required')) {
        <p class="error-inline">La contraseña es obligatoria</p>
      }
      @if (form.controls.password.touched && form.controls.password.hasError('minlength')) {
        <p class="error-inline">Mínimo 6 caracteres</p>
      }

      @if (error()) {
        <p class="error-global">{{ error() }}</p>
      }

      <button
        type="submit"
        class="btn-primary"
        [disabled]="form.invalid || loading()">
        {{ loading() ? 'Entrando...' : 'Iniciar sesión' }}
      </button>

    </form>

    <p class="auth-link">
      ¿No tienes cuenta?
      <a routerLink="/register">Regístrate</a>
    </p>
  </div>
</div>
```

- [ ] **Step 7.3 — Create `src/app/pages/login/login.scss`**

```scss
@import '../../../styles/variables';

.auth-page {
  min-height: 100vh;
  background-color: $earth-1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 20px;
}

.auth-logo {
  font-size: 26px;
  font-weight: 700;
  color: $green-7;
  margin-bottom: 28px;
  text-align: center;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  background: #f5efe6;
  border-radius: 20px;
  padding: 28px 20px;
}

.campo-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: $green-6;
  margin-bottom: 8px;
}

.campo-label--mt { margin-top: 16px; }

.campo-input {
  width: 100%;
  box-sizing: border-box;
  padding: 11px 14px;
  border: 1.5px solid white;
  border-radius: 12px;
  font-size: 14px;
  color: $green-7;
  background: white;
  font-family: inherit;

  &:focus { outline: none; border-color: $green-4; }
  &--error { border-color: #e11d48; }
}

.error-inline {
  font-size: 12px;
  color: #e11d48;
  margin: 4px 0 0;
}

.error-global {
  font-size: 13px;
  color: #e11d48;
  text-align: center;
  margin: 12px 0 0;
  padding: 10px 14px;
  background: #fef2f2;
  border-radius: 10px;
}

.btn-primary {
  width: 100%;
  margin-top: 20px;
  padding: 14px;
  border-radius: 12px;
  border: none;
  background: $earth-9;
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.2s;

  &:disabled { background: $green-3; cursor: not-allowed; }
  &:not(:disabled):hover { background: darken($earth-9, 6%); }
}

.auth-link {
  margin-top: 20px;
  text-align: center;
  font-size: 13px;
  color: $green-5;

  a {
    color: $green-6;
    font-weight: 600;
    text-decoration: none;

    &:hover { text-decoration: underline; }
  }
}
```

- [ ] **Step 7.4 — Build check**

```bash
npx ng build --configuration development 2>&1 | grep -i "error"
```

- [ ] **Step 7.5 — Commit**

```bash
git add src/app/pages/login/
git commit -m "feat: implement login page with TypedForm"
```

---

## Task 8 — Register page

**Files:**
- Modify: `src/app/pages/register/register.ts` (replace placeholder)
- Create: `src/app/pages/register/register.html`
- Create: `src/app/pages/register/register.scss`

- [ ] **Step 8.1 — Write password validator test**

Create `src/app/pages/register/register.spec.ts`:

```typescript
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { passwordsMatchValidator } from './register';

describe('passwordsMatchValidator', () => {
  function makeGroup(pass: string, confirm: string): AbstractControl {
    return new FormGroup({
      contrasena: new FormControl(pass),
      confirmarContrasena: new FormControl(confirm)
    });
  }

  it('returns null when passwords match', () => {
    expect(passwordsMatchValidator(makeGroup('abc123', 'abc123'))).toBeNull();
  });

  it('returns error when passwords do not match', () => {
    expect(passwordsMatchValidator(makeGroup('abc123', 'xyz789')))
      .toEqual({ passwordsMismatch: true });
  });
});
```

- [ ] **Step 8.2 — Run test — expect FAIL**

```bash
npx ng test --include="**/register/register.spec.ts" --watch=false
```

Expected: compile error.

- [ ] **Step 8.3 — Rewrite `src/app/pages/register/register.ts`**

```typescript
import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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
  imports: [ReactiveFormsModule, RouterLink],
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
```

- [ ] **Step 8.4 — Run tests — expect PASS**

```bash
npx ng test --include="**/register/register.spec.ts" --watch=false
```

Expected: 2 passing.

- [ ] **Step 8.5 — Create `src/app/pages/register/register.html`**

```html
<div class="auth-page">
  <div class="auth-logo">🌱 PlantealoApp</div>

  <div class="auth-card">
    <form [formGroup]="form" (ngSubmit)="onSubmit()">

      <!-- Nombre -->
      <label class="campo-label" for="nombre">Nombre</label>
      <input id="nombre" type="text" class="campo-input"
        [class.campo-input--error]="form.controls.nombre.invalid && form.controls.nombre.touched"
        formControlName="nombre" placeholder="Tu nombre" autocomplete="name">
      @if (form.controls.nombre.touched && form.controls.nombre.hasError('required')) {
        <p class="error-inline">El nombre es obligatorio</p>
      }

      <!-- Nombre de usuario -->
      <label class="campo-label campo-label--mt" for="nombre_usuario">Nombre de usuario</label>
      <input id="nombre_usuario" type="text" class="campo-input"
        [class.campo-input--error]="form.controls.nombre_usuario.invalid && form.controls.nombre_usuario.touched"
        formControlName="nombre_usuario" placeholder="solo_letras_y_numeros">
      @if (form.controls.nombre_usuario.touched && form.controls.nombre_usuario.hasError('required')) {
        <p class="error-inline">El nombre de usuario es obligatorio</p>
      }
      @if (form.controls.nombre_usuario.touched && form.controls.nombre_usuario.hasError('pattern')) {
        <p class="error-inline">Solo letras, números y guion bajo (_)</p>
      }

      <!-- Email -->
      <label class="campo-label campo-label--mt" for="reg-email">Email</label>
      <input id="reg-email" type="email" class="campo-input"
        [class.campo-input--error]="form.controls.email.invalid && form.controls.email.touched"
        formControlName="email" placeholder="tu@email.com" autocomplete="email">
      @if (form.controls.email.touched && form.controls.email.hasError('required')) {
        <p class="error-inline">El email es obligatorio</p>
      }
      @if (form.controls.email.touched && form.controls.email.hasError('email')) {
        <p class="error-inline">Introduce un email válido</p>
      }

      <!-- Contraseña -->
      <label class="campo-label campo-label--mt" for="contrasena">Contraseña</label>
      <input id="contrasena" type="password" class="campo-input"
        [class.campo-input--error]="form.controls.contrasena.invalid && form.controls.contrasena.touched"
        formControlName="contrasena" placeholder="Mínimo 6 caracteres" autocomplete="new-password">
      @if (form.controls.contrasena.touched && form.controls.contrasena.hasError('required')) {
        <p class="error-inline">La contraseña es obligatoria</p>
      }
      @if (form.controls.contrasena.touched && form.controls.contrasena.hasError('minlength')) {
        <p class="error-inline">Mínimo 6 caracteres</p>
      }

      <!-- Confirmar contraseña -->
      <label class="campo-label campo-label--mt" for="confirmar">Confirmar contraseña</label>
      <input id="confirmar" type="password" class="campo-input"
        [class.campo-input--error]="form.hasError('passwordsMismatch') && form.controls.confirmarContrasena.touched"
        formControlName="confirmarContrasena" placeholder="Repite la contraseña" autocomplete="new-password">
      @if (form.hasError('passwordsMismatch') && form.controls.confirmarContrasena.touched) {
        <p class="error-inline">Las contraseñas no coinciden</p>
      }

      <!-- Tipo dieta -->
      <label class="campo-label campo-label--mt">Tipo de dieta</label>
      <div class="dieta-pills">
        @for (op of dietaOpciones; track op.valor) {
          <button type="button" class="dieta-pill"
            [class.active]="form.controls.tipo_dieta.value === op.valor"
            (click)="form.controls.tipo_dieta.setValue(op.valor)">
            {{ op.emoji }} {{ op.label }}
          </button>
        }
      </div>

      <!-- Avatar -->
      <label class="campo-label campo-label--mt">Imagen de perfil (opcional)</label>
      <div class="upload-zone" (click)="avatarInput.click()">
        @if (avatarPreview()) {
          <img [src]="avatarPreview()" class="avatar-preview" alt="Vista previa">
        } @else {
          <svg class="upload-zone__icono" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="1.5"
               stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          <span class="upload-zone__texto">Haz clic para subir una imagen</span>
        }
        <input #avatarInput type="file" accept="image/*" class="upload-input"
               (change)="onAvatarSelected($event)">
      </div>

      @if (error()) {
        <p class="error-global">{{ error() }}</p>
      }

      <button type="submit" class="btn-primary"
        [disabled]="form.invalid || loading()">
        {{ loading() ? 'Creando cuenta...' : 'Crear cuenta' }}
      </button>

    </form>

    <p class="auth-link">
      ¿Ya tienes cuenta?
      <a routerLink="/login">Inicia sesión</a>
    </p>
  </div>
</div>
```

- [ ] **Step 8.6 — Create `src/app/pages/register/register.scss`**

```scss
@import '../../../styles/variables';

.auth-page {
  min-height: 100vh;
  background-color: $earth-1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 32px 20px 40px;
}

.auth-logo {
  font-size: 26px;
  font-weight: 700;
  color: $green-7;
  margin-bottom: 24px;
  text-align: center;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  background: #f5efe6;
  border-radius: 20px;
  padding: 28px 20px;
}

.campo-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: $green-6;
  margin-bottom: 8px;
}

.campo-label--mt { margin-top: 16px; }

.campo-input {
  width: 100%;
  box-sizing: border-box;
  padding: 11px 14px;
  border: 1.5px solid white;
  border-radius: 12px;
  font-size: 14px;
  color: $green-7;
  background: white;
  font-family: inherit;

  &:focus { outline: none; border-color: $green-4; }
  &--error { border-color: #e11d48; }
}

.error-inline {
  font-size: 12px;
  color: #e11d48;
  margin: 4px 0 0;
}

.error-global {
  font-size: 13px;
  color: #e11d48;
  text-align: center;
  margin: 12px 0 0;
  padding: 10px 14px;
  background: #fef2f2;
  border-radius: 10px;
}

.dieta-pills {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.dieta-pill {
  padding: 7px 14px;
  border-radius: 20px;
  border: 1.5px solid $green-3;
  background: white;
  color: $green-6;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s ease;

  &.active {
    background: $green-6;
    border-color: $green-6;
    color: white;
  }

  &:not(.active):hover { background: $green-1; }
}

.upload-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px 16px;
  border: 2px dashed #c8b89a;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.45);
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover { background: rgba(255, 255, 255, 0.7); }

  &__icono { width: 32px; height: 32px; color: $green-4; }
  &__texto  { font-size: 13px; color: $green-5; }
}

.upload-input { display: none; }

.avatar-preview {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}

.btn-primary {
  width: 100%;
  margin-top: 20px;
  padding: 14px;
  border-radius: 12px;
  border: none;
  background: $earth-9;
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.2s;

  &:disabled { background: $green-3; cursor: not-allowed; }
  &:not(:disabled):hover { background: darken($earth-9, 6%); }
}

.auth-link {
  margin-top: 20px;
  text-align: center;
  font-size: 13px;
  color: $green-5;

  a {
    color: $green-6;
    font-weight: 600;
    text-decoration: none;

    &:hover { text-decoration: underline; }
  }
}
```

- [ ] **Step 8.7 — Build check**

```bash
npx ng build --configuration development 2>&1 | grep -i "error"
```

- [ ] **Step 8.8 — Commit**

```bash
git add src/app/pages/register/
git commit -m "feat: implement register page with TypedForm and avatar upload"
```

---

## Task 9 — Perfil page

**Files:**
- Modify: `src/app/pages/perfil/perfil.ts`
- Modify: `src/app/pages/perfil/perfil.html`
- Modify: `src/app/pages/perfil/perfil.scss`

- [ ] **Step 9.1 — Rewrite `src/app/pages/perfil/perfil.ts`**

```typescript
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
```

- [ ] **Step 9.2 — Rewrite `src/app/pages/perfil/perfil.html`**

```html
<div class="perfil-page">

  <header class="perfil-page__header">
    <h1 class="perfil-page__titulo">Mi Perfil</h1>
  </header>

  @if (user(); as u) {
    <div class="perfil-card">

      <div class="perfil-avatar">
        @if (u.imagen_url) {
          <img [src]="u.imagen_url" [alt]="u.nombre" class="perfil-avatar__img">
        } @else {
          <span class="perfil-avatar__inicial">{{ u.nombre[0] | uppercase }}</span>
        }
      </div>

      <h2 class="perfil-nombre">{{ u.nombre }}</h2>
      <p class="perfil-username">&#64;{{ u.nombre_usuario }}</p>

      <span class="perfil-dieta">
        {{ dietaEmoji[u.tipo_dieta] }} {{ u.tipo_dieta | titlecase }}
      </span>

      <p class="perfil-email">{{ u.email }}</p>

    </div>
  } @else {
    <div class="perfil-loading">Cargando perfil…</div>
  }

  <button class="btn-logout" (click)="onLogout()">Cerrar sesión</button>

</div>
```

- [ ] **Step 9.3 — Rewrite `src/app/pages/perfil/perfil.scss`**

```scss
@import '../../../styles/variables';

.perfil-page {
  min-height: 100vh;
  background-color: $earth-1;
  padding: 24px 16px 80px;

  &__header { margin-bottom: 24px; }

  &__titulo {
    font-size: 28px;
    font-weight: 700;
    color: $green-7;
    margin: 0;
  }
}

.perfil-card {
  background: #f5efe6;
  border-radius: 20px;
  padding: 28px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
  margin-bottom: 20px;
}

.perfil-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: $green-4;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-bottom: 4px;

  &__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__inicial {
    font-size: 32px;
    font-weight: 700;
    color: white;
  }
}

.perfil-nombre {
  font-size: 20px;
  font-weight: 700;
  color: $green-7;
  margin: 0;
}

.perfil-username {
  font-size: 14px;
  color: $green-5;
  margin: 0;
}

.perfil-dieta {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  background: $green-1;
  color: $green-6;
  font-size: 13px;
  font-weight: 600;
  margin: 4px 0;
}

.perfil-email {
  font-size: 13px;
  color: $green-5;
  margin: 0;
}

.perfil-loading {
  text-align: center;
  color: $green-5;
  padding: 40px 0;
}

.btn-logout {
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  border: none;
  background: $earth-9;
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.2s;

  &:hover { background: darken($earth-9, 6%); }
}
```

- [ ] **Step 9.4 — Final build check**

```bash
npx ng build --configuration development 2>&1 | grep -i "error"
```

Expected: clean build.

- [ ] **Step 9.5 — Commit**

```bash
git add src/app/pages/perfil/
git commit -m "feat: implement perfil page with user data and logout"
```

---

## Manual Test Checklist

After all tasks complete, run `ng serve` and verify:

- [ ] Visiting `http://localhost:4200` redirects to `/login`
- [ ] Navbar is hidden on `/login` and `/register`
- [ ] Register form: validation errors appear on blur
- [ ] Register form: "Las contraseñas no coinciden" appears on mismatch
- [ ] Registering a new user creates a doc in Firestore `usuarios/{uid}`
- [ ] After register → lands on `/inicio` with navbar visible
- [ ] Perfil page shows name, @username, dieta badge, email
- [ ] Logout → redirects to `/login`
- [ ] Login with wrong password → "Email o contraseña incorrectos"
- [ ] Login with correct credentials → lands on `/inicio`
- [ ] Visiting `/login` while logged in → redirects to `/inicio`
- [ ] Refreshing the page while logged in → stays on current route (persistence works)
