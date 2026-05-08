import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { firstValueFrom, of } from 'rxjs';
import { authGuard, guestGuard } from './auth.guard';
import { AuthService } from '../services/auth';
import { Usuario } from '../models/interfaces';

const mockUser: Usuario = {
  uid: '123', nombre: 'Test', nombre_usuario: 'test_user',
  email: 'test@test.com', tipo_dieta: 'OMNIVORA',
};

function runGuard(guard: typeof authGuard | typeof guestGuard, user: Usuario | null) {
  const authService = { currentUser$: of(user) } as unknown as AuthService;
  const router = { createUrlTree: (commands: string[]) => commands } as unknown as Router;
  TestBed.configureTestingModule({
    providers: [
      { provide: AuthService, useValue: authService },
      { provide: Router, useValue: router },
    ],
  });
  return TestBed.runInInjectionContext(() => guard({} as never, {} as never));
}

describe('authGuard', () => {
  it('allows access when user is logged in', async () => {
    const result = await firstValueFrom(runGuard(authGuard, mockUser) as ReturnType<typeof of>);
    expect(result).toBe(true);
  });
  it('redirects to /login when user is null', async () => {
    const result = await firstValueFrom(runGuard(authGuard, null) as ReturnType<typeof of>);
    expect(result).toEqual(['/login']);
  });
});

describe('guestGuard', () => {
  it('allows access when user is null', async () => {
    const result = await firstValueFrom(runGuard(guestGuard, null) as ReturnType<typeof of>);
    expect(result).toBe(true);
  });
  it('redirects to /inicio when user is logged in', async () => {
    const result = await firstValueFrom(runGuard(guestGuard, mockUser) as ReturnType<typeof of>);
    expect(result).toEqual(['/inicio']);
  });
});
