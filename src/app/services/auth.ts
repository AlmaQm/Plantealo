import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, of, from, switchMap, map, catchError } from 'rxjs';

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
  private readonly firestore = inject(Firestore);
  private readonly storage = inject(Storage);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  readonly currentUser$: Observable<Usuario | null> = isPlatformBrowser(this.platformId)
    ? authState(this.auth).pipe(
        switchMap(user => {
          if (!user) {
            this.clearStoredUser();
            return of(null);
          }
          const docRef = doc(this.firestore, `usuarios/${user.uid}`);
          return from(getDoc(docRef)).pipe(
            map(snap => {
              const usuario = snap.exists() ? (snap.data() as Usuario) : null;
              if (usuario) this.saveStoredUser(usuario);
              // Si Firestore no tiene el doc, usar localStorage
              return usuario ?? this.getStoredUser();
            }),
            // Si Firestore falla (reglas, sin conexión), usar localStorage
            catchError(() => of(this.getStoredUser()))
          );
        })
      )
    : of(null);

  getStoredUser(): Usuario | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Usuario) : null;
    } catch {
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
    // Paso 1: crear usuario en Firebase Auth (único paso que puede lanzar error)
    let uid: string;
    try {
      const credential = await createUserWithEmailAndPassword(
        this.auth, data.email, password
      );
      uid = credential.user.uid;
    } catch (error) {
      throw new Error(mapAuthError(error as { code?: string }));
    }

    // Paso 2: subir avatar si existe (fallo no bloquea el registro)
    let imagen_url: string | undefined = data.imagen_url;
    if (avatarFile) {
      try { imagen_url = await this.uploadAvatar(avatarFile, uid); }
      catch { /* continúa sin imagen */ }
    }

    const usuario: Usuario = {
      uid, nombre: data.nombre, nombre_usuario: data.nombre_usuario,
      email: data.email, tipo_dieta: data.tipo_dieta,
      ...(imagen_url ? { imagen_url } : {}),
      fechaRegistro: new Date(),
    };

    // Paso 3: guardar en localStorage inmediatamente (siempre disponible)
    this.saveStoredUser(usuario);

    // Paso 4: intentar escribir en Firestore (fallo no bloquea la sesión)
    try {
      await setDoc(doc(this.firestore, `usuarios/${uid}`), usuario);
    } catch { /* Firestore puede fallar, el usuario sigue registrado */ }
  }

  async logout(): Promise<void> {
    this.clearStoredUser();
    await signOut(this.auth);
    await this.router.navigate(['/login']);
  }

  async uploadAvatar(file: File, uid: string): Promise<string> {
    const storageRef = ref(this.storage, `avatares/${uid}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  }
}
