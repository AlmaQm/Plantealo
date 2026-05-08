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
        this.auth, data.email, password
      );
      const uid = credential.user.uid;
      let imagen_url: string | undefined = data.imagen_url;
      if (avatarFile) {
        imagen_url = await this.uploadAvatar(avatarFile, uid);
      }
      const usuario: Usuario = {
        uid, nombre: data.nombre, nombre_usuario: data.nombre_usuario,
        email: data.email, tipo_dieta: data.tipo_dieta,
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
