import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PublicacionCardComponent } from './publicacion-card';
import { Publicacion } from '../../../models/interfaces';

const mockPublicacion: Publicacion = {
  publicacion_id: 1,
  usuario_id: 2,
  nombre_usuario: 'Test User',
  username: '@test',
  avatar_inicial: 'T',
  imagen_url: 'assets/test.jpg',
  categoria: 'HUERTO',
  descripcion: 'Descripción de prueba',
  likes: 5,
  liked: false,
  siguiendo: false,
  fecha: new Date('2026-05-01'),
  comentarios: []
};

describe('PublicacionCardComponent', () => {
  let component: PublicacionCardComponent;
  let fixture: ComponentFixture<PublicacionCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicacionCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PublicacionCardComponent);
    component = fixture.componentInstance;
    component.publicacion = mockPublicacion;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize likes from input', () => {
    expect(component.likes()).toBe(5);
  });

  it('should toggle like and update count', () => {
    component.toggleLike();
    expect(component.liked()).toBe(true);
    expect(component.likes()).toBe(6);
    component.toggleLike();
    expect(component.liked()).toBe(false);
    expect(component.likes()).toBe(5);
  });

  it('should toggle siguiendo', () => {
    component.toggleSeguir();
    expect(component.siguiendo()).toBe(true);
    component.toggleSeguir();
    expect(component.siguiendo()).toBe(false);
  });

  it('should add comment and clear field', () => {
    component.nuevoComentario.set('Hola!');
    component.enviarComentario();
    expect(component.comentarios().length).toBe(1);
    expect(component.nuevoComentario()).toBe('');
  });

  it('should not add empty comment', () => {
    component.nuevoComentario.set('  ');
    component.enviarComentario();
    expect(component.comentarios().length).toBe(0);
  });
});
