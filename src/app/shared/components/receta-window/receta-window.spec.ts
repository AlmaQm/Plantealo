import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { RecetaWindowComponent } from './receta-window';

describe('RecetaWindowComponent', () => {
  let component: RecetaWindowComponent;
  let fixture: ComponentFixture<RecetaWindowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecetaWindowComponent],
      providers: [provideHttpClient()]
    }).compileComponents();

    fixture = TestBed.createComponent(RecetaWindowComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
