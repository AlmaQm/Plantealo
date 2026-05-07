import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecetaCardComponent } from './receta-card';
import { Recipe } from '../../../models/interfaces';

const mockRecipe: Recipe = {
  id: '1',
  name: 'Test Recipe',
  description: 'A test recipe',
  category: 'principal',
  type_dieta: ['omnivora'],
  prepTime: 30,
  difficulty: 'facil',
  servings: 2,
  imageUrl: 'https://example.com/img.jpg',
  instructions: ['Step 1'],
  ingredients: [{ name: 'Salt', measure: '1 tsp', isFromGarden: false }]
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
