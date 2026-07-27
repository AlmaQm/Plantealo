import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, from, switchMap, catchError, firstValueFrom, timeout } from 'rxjs';

import { environment } from '../../environments/environment';

import { Auth, authState } from '@angular/fire/auth';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  browserLocalPersistence,
  setPersistence,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  deleteUser,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';

import { Usuario } from '../models/interfaces';

export const ERROR_EMAIL_EXISTENTE = 'El usuario ya existe';
export const ERROR_NO_REGISTRADO  = 'Usuario no registrado';

export function mapAuthError(error: { code?: string }): string {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return ERROR_EMAIL_EXISTENTE;
    case 'auth/user-not-found':
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return ERROR_NO_REGISTRADO;
    case 'auth/weak-password':
      return 'La contraseña debe tener al menos 6 caracteres';
    default:
      return 'Ha ocurrido un error. Inténtalo de nuevo';
  }
}

const STORAGE_KEY = 'plantealo_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly http = inject(HttpClient);

  // currentUser$ - NOMÉS llegeix de localStorage i sincronitza amb Aiven
  readonly currentUser$: Observable<Usuario | null> = isPlatformBrowser(this.platformId)
    ? authState(this.auth).pipe(
        switchMap(fbUser => {
          if (!fbUser) {
            this.clearStoredUser();
            return of(null);
          }

          // Obtenir usuari de localStorage
          const usuario = this.getStoredUser();

          // Si no hi ha dades a localStorage, o la sincronització anterior no
          // va arribar a guardar l'usuario_id, cal esperar la sincronització
          // abans d'emetre: si no, components com la recomanació de receptes
          // (que necessiten usuario_id) es queden en silenci sense cap avís.
          if (!usuario || !usuario.usuario_id) {
            return from(this.syncUserFromAiven(fbUser.uid, fbUser.email || ''));
          }

          // Ja tenim un usuari vàlid en local: refresquem en segon pla sense
          // bloquejar l'emissió.
          this.syncWithAiven(usuario, fbUser.uid).catch(err => {
            console.error('❌ [currentUser$] Error sincronitzant:', err);
          });

          return of(usuario);
        })
      )
    : of(null);

  // Sincronitzar usuari des de Aiven pel seu uid
  private async syncUserFromAiven(uid: string, email: string): Promise<Usuario | null> {
    try {
      const res = await firstValueFrom(
        this.http.get<Usuario>(`${environment.apiUrl}/usuarios/by-uid/${uid}`).pipe(
          timeout(5000),
          catchError((err) => {
            console.error('❌ [syncUserFromAiven] Error:', err);
            return of(null);
          })
        )
      );

      if (res) {
        // El backend (schemas.UsuarioOut) devuelve `firebase_uid`, no `uid`: si se
        // guardara `res` tal cual, el usuario en localStorage se quedaría sin `uid`
        // (undefined), rompiendo en silencio cualquier flujo que dependa de
        // getStoredUser()?.uid (p. ej. publicar excedente de cosecha desde Home).
        const usuario: Usuario = { ...res, uid };
        this.saveStoredUser(usuario);
        return usuario;
      }

      // Si no existeix a Aiven, crear un usuari mínim
      const nuevoUsuario: Usuario = {
        uid,
        email,
        nombre: email.split('@')[0] || 'Usuario',
        nombre_usuario: email.split('@')[0] || 'usuario',
        tipo_dieta: 'OMNIVORA',
        fechaRegistro: new Date(),
      };

      // Intentar sync per crear-lo
      await this.syncWithAiven(nuevoUsuario, uid);
      this.saveStoredUser(nuevoUsuario);
      return nuevoUsuario;

    } catch (err) {
      console.error('❌ [syncUserFromAiven] Error general:', err);
      return null;
    }
  }

  // Sincronitzar amb Aiven (POST /usuarios/sync)
  private async syncWithAiven(usuario: Usuario, uid: string): Promise<boolean> {
    // Repara cualquier objeto ya guardado en localStorage al que le falte 'uid'
    // (p. ej. sesiones cacheadas antes de que syncUserFromAiven empezara a
    // adjuntarlo): sin esto, un usuario con datos viejos en caché nunca
    // recupera el uid solo con los syncs en segundo plano.
    usuario.uid = uid;
    try {
      const payload = {
        firebase_uid: uid,
        nombre: usuario.nombre || '',
        nombre_usuario: usuario.nombre_usuario || '',
        email: usuario.email || '',
        tipo_dieta: usuario.tipo_dieta || 'OMNIVORA',
        imagen_url: usuario.imagen_url || null,
        ciudad: usuario.ciudad || null,
      };

      const res = await firstValueFrom(
        this.http.post<{ usuario_id: number }>(
          `${environment.apiUrl}/usuarios/sync`,
          payload
        ).pipe(
          timeout(5000),
          catchError((err) => {
            console.error('❌ [syncWithAiven] Error:', err);
            if (err.status === 422) {
              console.error('❌ [syncWithAiven] Error 422 - Dades invàlides:', err.error);
            }
            return of(null);
          })
        )
      );

      if (res?.usuario_id) {
        usuario.usuario_id = res.usuario_id;
        this.saveStoredUser(usuario);
        return true;
      }
      return false;
    } catch (err) {
      console.error('❌ [syncWithAiven] Error inesperat:', err);
      return false;
    }
  }

  async actualizarPerfil(datos: {
    nombre_usuario: string;
    tipo_dieta: Usuario['tipo_dieta'];
    imagen_url?: string;
    ciudad?: string;
  }): Promise<boolean> {
    const usuarioActual = this.getStoredUser();
    const uid = this.auth.currentUser?.uid;
    if (!usuarioActual || !uid) {
      throw new Error('No se pudo actualizar el perfil: sesión no válida');
    }
    const actualizado: Usuario = { ...usuarioActual, ...datos };
    return await this.syncWithAiven(actualizado, uid);
  }

  async uploadAvatar(file: File, uid: string): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await firstValueFrom(
      this.http.post<{ imagen_url: string }>(
        `${environment.apiUrl}/usuarios/by-uid/${uid}/avatar`,
        formData
      )
    );
    return res.imagen_url;
  }

  getStoredUser(): Usuario | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Usuario) : null;
    } catch (err) {
      console.error('❌ [getStoredUser] Error:', err);
      return null;
    }
  }

  private saveStoredUser(usuario: Usuario): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(usuario));
    }
  }

  private clearStoredUser(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  constructor() {
    if (typeof window !== 'undefined') {
      setPersistence(this.auth, browserLocalPersistence).catch(() => {});
    }
    if (isPlatformBrowser(this.platformId)) {
      this.currentUser$.subscribe({
        next: () => {},
        error: (err) => {
          console.error('❌ [currentUser$ subscription] Error:', err);
        }
      });
    }
  }

  async login(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
    } catch (error) {
      console.error('❌ [login] Error:', error);
      throw new Error(mapAuthError(error as { code?: string }));
    }
  }

  async register(
    data: Omit<Usuario, 'uid' | 'fechaRegistro'>,
    password: string,
    avatarFile?: File
  ): Promise<void> {
    // Paso 1: crear usuario en Firebase Auth
    let uid: string;
    try {
      const credential = await createUserWithEmailAndPassword(
        this.auth, data.email, password
      );
      uid = credential.user.uid;
    } catch (error) {
      console.error('❌ [register] Error creant usuari a Firebase:', error);
      throw new Error(mapAuthError(error as { code?: string }));
    }

    // Paso 2: crear objeto usuario y sincronizar DIRECTAMENT amb Aiven (sense
    // Firestore), sin foto todavía: el registro en Aiven tiene que existir
    // antes de poder subir el avatar, porque el backend busca el usuario por
    // firebase_uid en /usuarios/by-uid/{uid}/avatar y responde 404 si no existe.
    const usuario: Usuario = {
      uid,
      nombre: data.nombre,
      nombre_usuario: data.nombre_usuario,
      email: data.email,
      tipo_dieta: data.tipo_dieta,
      imagen_url: data.imagen_url ?? undefined,
      fechaRegistro: new Date(),
    };

    try {
      const payload = {
        firebase_uid: uid,
        nombre: data.nombre,
        nombre_usuario: data.nombre_usuario,
        email: data.email,
        tipo_dieta: data.tipo_dieta,
        imagen_url: usuario.imagen_url || null,
        ciudad: data.ciudad || null,
      };

      const res = await firstValueFrom(
        this.http.post<{ usuario_id: number }>(
          `${environment.apiUrl}/usuarios/sync`,
          payload
        ).pipe(
          timeout(5000),
          catchError((err) => {
            console.error('❌ [register] Error en sync:', err);
            if (err.status === 422) {
              console.error('❌ [register] Error 422 - Dades invàlides:', err.error);
            }
            return of(null);
          })
        )
      );

      if (res?.usuario_id) {
        usuario.usuario_id = res.usuario_id;
      }
    } catch (err) {
      console.error('❌ [register] Error inesperat en sync:', err);
    }

    // Paso 3: ahora que el usuario ya existe en Aiven, subir el avatar si el
    // usuario ha elegido uno (opcional, no bloqueante). El propio endpoint de
    // avatar ya persiste imagen_url en Aiven, así que solo hace falta
    // reflejar la URL devuelta en el objeto local.
    if (avatarFile) {
      try {
        usuario.imagen_url = await this.uploadAvatar(avatarFile, uid);
      } catch (error) {
        console.error('❌ [register] Error al subir el avatar (se continúa sin foto):', error);
      }
    }

    // Paso 4: guardar el usuario final (con imagen_url ya resuelta) en localStorage
    this.saveStoredUser(usuario);
  }

  async loginConGoogle(): Promise<void> {
    try {
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(this.auth, provider);
      const uid = credential.user.uid;

      // Comprova si l'usuari ja existeix a Aiven; si no, el crea amb les
      // dades de Google (mateix patró que syncUserFromAiven/register).
      const existe = await firstValueFrom(
        this.http.get<Usuario>(`${environment.apiUrl}/usuarios/by-uid/${uid}`).pipe(
          catchError(() => of(null))
        )
      );

      if (!existe) {
        const nombre = credential.user.displayName ?? 'Usuario';
        const email = credential.user.email ?? '';
        const nuevoUsuario: Usuario = {
          uid,
          email,
          nombre,
          nombre_usuario: email.split('@')[0] || 'usuario',
          tipo_dieta: 'OMNIVORA',
          imagen_url: credential.user.photoURL ?? undefined,
          fechaRegistro: new Date(),
        };
        await this.syncWithAiven(nuevoUsuario, uid);
        this.saveStoredUser(nuevoUsuario);
      }
    } catch (error) {
      console.error('❌ [loginConGoogle] Error:', error);
      throw new Error(mapAuthError(error as { code?: string }));
    }
  }

  async logout(): Promise<void> {
    this.clearStoredUser();
    await signOut(this.auth);
    await this.router.navigate(['/login']);
  }

  async cambiarPassword(passwordActual: string, passwordNueva: string): Promise<void> {
    const firebaseUser = this.auth.currentUser;
    if (!firebaseUser?.email) {
      throw new Error('No se pudo verificar la sesión actual.');
    }

    try {
      const credential = EmailAuthProvider.credential(firebaseUser.email, passwordActual);
      await reauthenticateWithCredential(firebaseUser, credential);
    } catch (err) {
      console.error('❌ [cambiarPassword] Error de reautenticación:', err);
      throw new Error('La contraseña actual no es correcta.');
    }

    try {
      await updatePassword(firebaseUser, passwordNueva);
    } catch (err) {
      console.error('❌ [cambiarPassword] Error al actualizar la contraseña:', err);
      throw new Error('No se pudo cambiar la contraseña. Inténtalo de nuevo.');
    }
  }

  async eliminarCuenta(password: string): Promise<void> {
    const firebaseUser = this.auth.currentUser;
    if (!firebaseUser?.email) {
      throw new Error('No se pudo verificar la sesión actual.');
    }

    try {
      const credential = EmailAuthProvider.credential(firebaseUser.email, password);
      await reauthenticateWithCredential(firebaseUser, credential);
    } catch (err) {
      console.error('❌ [eliminarCuenta] Error de reautenticación:', err);
      throw new Error('La contraseña no es correcta.');
    }

    // 1. Aiven primero: si falla, no tocamos Firebase y la cuenta queda intacta.
    try {
      await firstValueFrom(
        this.http.delete(`${environment.apiUrl}/usuarios/by-uid/${firebaseUser.uid}`)
      );
    } catch (err) {
      console.error('❌ [eliminarCuenta] Error al borrar los datos en Aiven:', err);
      throw new Error('No se pudo eliminar la cuenta. Inténtalo de nuevo.');
    }

    // 2. Firebase después, solo si Aiven ha confirmado el borrado.
    await deleteUser(firebaseUser);

    this.clearStoredUser();
    await this.router.navigate(['/login']);
  }
}
