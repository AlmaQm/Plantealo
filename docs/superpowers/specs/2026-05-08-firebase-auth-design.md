# Firebase Authentication — PlantealoApp
**Date:** 2026-05-08  
**Status:** Approved  
**Approach:** Capas de fuera hacia dentro (B)

---

## 1. Scope

Full Firebase Auth (email/password) + Firestore user profile storage + Firebase Storage for avatar images. Covers: service, guard, login page, register page, and profile page. No social login, no email verification, no password reset in this iteration.

---

## 2. Infrastructure

### 2.1 Environment files
Create `src/environments/environment.ts` and `environment.prod.ts` both exporting:
```ts
export const environment = {
  production: false, // true in prod
  firebaseConfig: { /* provided config */ }
};
```

### 2.2 `app.config.ts` providers
Add in order:
```ts
provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
provideAuth(() => {
  if (isPlatformBrowser(platformId)) {
    const auth = initializeAuth(getApp(), { persistence: browserLocalPersistence });
    return auth;
  }
  return getAuth();
}),
provideFirestore(() => getFirestore()),
provideStorage(() => getStorage()),
```
`platformId` injected via `inject(PLATFORM_ID)` inside a factory function.

### 2.3 `interfaces.ts` — Usuario model
Replace existing `Usuario` interface:
```ts
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
Update any references to old fields (`usuario_id`, `recetasGuardadasIds`).

---

## 3. AuthService (`services/auth.ts`)

**Provided in root. All methods typed, no `any`.**

### Signals / Observables
- `currentUser$: Observable<Usuario | null>` — derived from `authState(this.auth)`, maps Firebase User to Firestore doc fetch.

### Methods
| Method | Signature | Behaviour |
|---|---|---|
| login | `(email: string, password: string): Promise<void>` | `signInWithEmailAndPassword`, throws mapped error |
| register | `(usuario: Usuario, password: string): Promise<void>` | `createUserWithEmailAndPassword` → write Firestore doc `/usuarios/{uid}` |
| logout | `(): Promise<void>` | `signOut`, navigate to `/login` |
| uploadAvatar | `(file: File, uid: string): Promise<string>` | Upload to `Storage: avatares/{uid}`, return download URL |

### Error mapping
Firebase error codes mapped to Spanish strings:
- `auth/email-already-in-use` → "Este email ya está registrado"
- `auth/user-not-found` / `auth/invalid-credential` → "Email o contraseña incorrectos"
- `auth/wrong-password` → "Email o contraseña incorrectos"
- `auth/weak-password` → "La contraseña debe tener al menos 6 caracteres"
- Default → "Ha ocurrido un error. Inténtalo de nuevo"

---

## 4. Auth Guard (`guards/auth.guard.ts`)

Two functional guards (Angular 15+ pattern):

**`authGuard`**
```ts
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.currentUser$.pipe(
    take(1),
    map(user => user ? true : router.createUrlTree(['/login']))
  );
};
```

**`guestGuard`** — same pattern, inverted: logged-in user → `/inicio`.

### Route table
```
/login      guestGuard   → LoginPage
/register   guestGuard   → RegisterPage
/inicio     authGuard    → Home
/plantas    authGuard    → Plantas
/recetas    authGuard    → Recetas
/comunidad  authGuard    → Comunidad
/perfil     authGuard    → Perfil
''                       → redirect /inicio
```

### Hiding navbar
In `app.html`, wrap `<app-navbar>` with:
```html
@if (!isAuthRoute()) { <app-navbar /> }
```
`isAuthRoute()` is a computed signal in `app.ts` checking `router.url`.

---

## 5. Login Page (`pages/login/`)

### Form (TypedForm)
```ts
FormGroup<{
  email: FormControl<string>;
  password: FormControl<string>;
}>
```
Validators: `email` → required + email format. `password` → required + minLength(6).

### Template structure
```
[🌱 PlantealoApp]   ← centrado, grande
[card blanca]
  Email input
  Password input
  [error message]
  [Iniciar sesión]  ← btn full-width $earth-9
  ¿No tienes cuenta? [Regístrate]
```

### Behaviour
- Submit disabled while loading (signal `loading`)
- On success → `router.navigate(['/inicio'])`
- On error → show mapped message below the form

---

## 6. Register Page (`pages/register/`)

### Form (TypedForm)
```ts
FormGroup<{
  nombre: FormControl<string>;
  nombre_usuario: FormControl<string>;
  email: FormControl<string>;
  contrasena: FormControl<string>;
  confirmarContrasena: FormControl<string>;
  tipo_dieta: FormControl<'OMNIVORA' | 'VEGETARIANA' | 'VEGANA'>;
  imagen_url: FormControl<string>;
}>
```

Validators:
- `nombre` — required
- `nombre_usuario` — required, pattern `^[a-zA-Z0-9_]+$`
- `email` — required, email
- `contrasena` — required, minLength(6)
- `confirmarContrasena` — cross-field validator (matches `contrasena`)
- `tipo_dieta` — required, default `'OMNIVORA'`
- `imagen_url` — optional

### Template structure
```
[🌱 PlantealoApp]
[card blanca, scrollable]
  nombre
  nombre_usuario
  email
  contraseña + confirmar
  [tipo_dieta pills: 🥩 Omnívora | 🥗 Vegetariana | 🌱 Vegana]
  [upload-zone imagen] — same component pattern as comunidad modal
  [Crear cuenta]  ← btn full-width $earth-9
  ¿Ya tienes cuenta? [Inicia sesión]
```

### Image upload flow
1. User selects file → preview shown
2. On submit: `authService.uploadAvatar(file, uid)` → get URL → save in Firestore doc

### Behaviour
- Errors shown inline below each field
- Firebase errors shown below the button
- On success → `router.navigate(['/inicio'])`

---

## 7. Perfil Page (`pages/perfil/`)

Reads `authService.currentUser$` via `toSignal()`.

### Layout
```
[Avatar circular 80px — imagen o inicial con fondo $green-4]
[nombre]
[@nombre_usuario]
[badge tipo_dieta con emoji]
[email — text $green-5]
─────────────────────────
[Cerrar sesión] ← btn full-width $earth-9
```

No edit functionality in this iteration.

---

## 8. Visual Design

Consistent with existing app:
- Fondo páginas auth: `$earth-1` (#e5d7c4)
- Card: blanca, `border-radius: 20px`, `padding: 28px 20px`
- Inputs: fondo blanco, borde blanco, `border-radius: 12px` — idéntico al modal de comunidad
- Botón primario: `$earth-9` (#4c3d19), texto blanco, full-width
- Links secundarios: color `$green-6`, sin fondo
- Navbar: oculta en `/login` y `/register`
- Logo: `🌱 PlantealoApp` en `font-size: 26px`, `font-weight: 700`, `color: $green-7`, centrado

---

## 9. File Checklist

```
NEW:
src/environments/environment.ts
src/environments/environment.prod.ts
src/app/guards/auth.guard.ts
src/app/pages/login/login.ts + .html + .scss
src/app/pages/register/register.ts + .html + .scss

MODIFIED:
src/app/app.config.ts          — Firebase providers
src/app/app.routes.ts          — guards + new routes
src/app/app.ts / app.html      — hide navbar on auth routes
src/app/models/interfaces.ts   — replace Usuario interface
src/app/services/auth.ts       — new auth service (replaces empty if exists)
src/app/pages/perfil/perfil.ts + .html + .scss — real user data
```

---

## 10. Out of scope

- Email verification
- Password reset / forgot password
- Social login (Google, GitHub)
- Edit profile
- Role-based access control
