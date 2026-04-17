import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecetasComponent } from './recetas';

describe('RecetasComponent', () => {
  let component: RecetasComponent;
  let fixture: ComponentFixture<RecetasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecetasComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RecetasComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
