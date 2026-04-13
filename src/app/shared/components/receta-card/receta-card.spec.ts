import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecetaCard } from './receta-card';

describe('RecetaCard', () => {
  let component: RecetaCard;
  let fixture: ComponentFixture<RecetaCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecetaCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecetaCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
