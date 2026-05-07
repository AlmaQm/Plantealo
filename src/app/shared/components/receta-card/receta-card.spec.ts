import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecetaCardComponent } from './receta-card';

describe('RecetaCardComponent', () => {
  let component: RecetaCardComponent;
  let fixture: ComponentFixture<RecetaCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecetaCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(RecetaCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
