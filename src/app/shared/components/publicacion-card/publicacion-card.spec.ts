import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PublicacionCardComponent } from './publicacion-card';
import { ComunidadService } from '../../../services/comunidad';
import { Publicacion } from '../../../models/interfaces';

const mockPublicacion: Publicacion = {
  publicacion_id: '1',
  usuario_id: '2',
  nombre_usuario: 'Test User',
  username: '@test',
  avatar_inicial: 'T',
  imagen_url: 'assets/test.jpg',
  categoria: 'HUERTO',
  descripcion: 'Descripción de prueba',
  likes: 5,
  liked: false,
  guardada: false,
  siguiendo: false,
  fecha: new Date('2026-05-01'),
  comentarios: []
};

class MockComunidadService {
  toggleLike = jasmine.createSpy('toggleLike').and.resolveTo(undefined);
  toggleGuardar = jasmine.createSpy('toggleGuardar').and.resolveTo(undefined);
  agregarComentario = jasmine.createSpy('agregarComentario').and.resolveTo(undefined);
}

describe('PublicacionCardComponent', () => {
  let component: PublicacionCardComponent;
  let fixture: ComponentFixture<PublicacionCardComponent>;
  let comunidadService: MockComunidadService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicacionCardComponent],
      providers: [{ provide: ComunidadService, useClass: MockComunidadService }]
    }).compileComponents();

    fixture = TestBed.createComponent(PublicacionCardComponent);
    component = fixture.componentInstance;
    component.publicacion = { ...mockPublicacion, comentarios: [] };
    fixture.detectChanges();
    await fixture.whenStable();

    comunidadService = TestBed.inject(ComunidadService) as unknown as MockComunidadService;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show likes from input', () => {
    expect(component.publicacion.likes).toBe(5);
  });

  it('should delegate like toggling to the service', async () => {
    await component.toggleLike();
    expect(comunidadService.toggleLike).toHaveBeenCalledWith('1', false);
  });

  it('should toggle siguiendo locally', () => {
    component.toggleSeguir();
    expect(component.siguiendo()).toBe(true);
    component.toggleSeguir();
    expect(component.siguiendo()).toBe(false);
  });

  it('should delegate new comments to the service and clear the field', async () => {
    component.nuevoComentario.set('Hola!');
    await component.enviarComentario();
    expect(comunidadService.agregarComentario).toHaveBeenCalledWith('1', 'Hola!');
    expect(component.nuevoComentario()).toBe('');
  });

  it('should not add empty comment', async () => {
    component.nuevoComentario.set('  ');
    await component.enviarComentario();
    expect(comunidadService.agregarComentario).not.toHaveBeenCalled();
  });
});
