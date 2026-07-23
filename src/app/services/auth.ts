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
          let usuario = this.getStoredUser();

          // Si no hi ha dades a localStorage, intentar sincronitzar amb Aiven
          if (!usuario) {
            // Intentar obtenir de Aiven pel uid
            return from(this.syncUserFromAiven(fbUser.uid, fbUser.email || ''));
          }

          // Si tenim usuari a localStorage, sincronitzar amb Aiven per actualitzar
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
        this.saveStoredUser(res);
        return res;
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
    try {
      const payload = {
        firebase_uid: uid,
        nombre: usuario.nombre || '',
        nombre_usuario: usuario.nombre_usuario || '',
        email: usuario.email || '',
        tipo_dieta: usuario.tipo_dieta || 'OMNIVORA',
        imagen_url: usuario.imagen_url || null,
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

  async actualizarPerfil(datos: { nombre_usuario: string; tipo_dieta: Usuario['tipo_dieta'] }): Promise<boolean> {
    const usuarioActual = this.getStoredUser();
    const uid = this.auth.currentUser?.uid;
    if (!usuarioActual || !uid) {
      throw new Error('No se pudo actualizar el perfil: sesión no válida');
    }
    const actualizado: Usuario = { ...usuarioActual, ...datos };
    return await this.syncWithAiven(actualizado, uid);
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

    // Paso 2: crear objeto usuario
    const usuario: Usuario = {
      uid,
      nombre: data.nombre,
      nombre_usuario: data.nombre_usuario,
      email: data.email,
      tipo_dieta: data.tipo_dieta,
      imagen_url: data.imagen_url,
      fechaRegistro: new Date(),
    };

    // Paso 3: guardar en localStorage
    this.saveStoredUser(usuario);

    // Paso 4: Sincronitzar DIRECTAMENT amb Aiven (sense Firestore)
    try {
      const payload = {
        firebase_uid: uid,
        nombre: data.nombre,
        nombre_usuario: data.nombre_usuario,
        email: data.email,
        tipo_dieta: data.tipo_dieta,
        imagen_url: data.imagen_url || null,
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
        this.saveStoredUser(usuario);
      }
    } catch (err) {
      console.error('❌ [register] Error inesperat en sync:', err);
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
