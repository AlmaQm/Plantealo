import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { Comunidad } from './comunidad';
import { ComunidadService } from '../../services/comunidad';

class MockComunidadService {
  feed = signal([]).asReadonly();
  crearPublicacion = jasmine.createSpy('crearPublicacion').and.resolveTo(undefined);
}

describe('Comunidad', () => {
  let component: Comunidad;
  let fixture: ComponentFixture<Comunidad>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Comunidad],
      providers: [{ provide: ComunidadService, useClass: MockComunidadService }]
    }).compileComponents();

    fixture = TestBed.createComponent(Comunidad);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
