import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecetaCardComponent } from './receta-card';
import { Recipe } from '../../../models/interfaces';

const mockRecipe: Recipe = {
  id_receta: 1,
  nombre_receta: 'Test Recipe',
  descripcion: 'A test recipe',
  categoria: 'PRINCIPAL',
  tipo_dieta: 'VEGANA',
  tiempo_preparacion: 30,
  dificultad: 'FACIL',
  num_comensales: 2,
  imagen_url: 'assets/images/test.jpg',
  instrucciones: ['Paso 1'],
  ingredientes: [{ nombre_ingrediente: 'sal', cantidad: '1 pizca' }]
};

describe('RecetaCardComponent', () => {
  let component: RecetaCardComponent;
  let fixture: ComponentFixture<RecetaCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecetaCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(RecetaCardComponent);
    component = fixture.componentInstance;
    component.recipe = mockRecipe;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
