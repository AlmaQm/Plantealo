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
