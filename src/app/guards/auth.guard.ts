import { PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';

export const authGuard: CanActivateFn = async () => {
  if (!isPlatformBrowser(inject(PLATFORM_ID))) return true;
  const auth = inject(Auth);
  const router = inject(Router);
  await auth.authStateReady();
  return auth.currentUser !== null ? true : router.createUrlTree(['/login']);
};

export const guestGuard: CanActivateFn = async () => {
  if (!isPlatformBrowser(inject(PLATFORM_ID))) return true;
  const auth = inject(Auth);
  const router = inject(Router);
  await auth.authStateReady();
  return auth.currentUser === null ? true : router.createUrlTree(['/inicio']);
};
