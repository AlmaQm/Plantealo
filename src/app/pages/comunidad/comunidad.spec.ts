import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComunidadComponent } from './comunidad';

describe('ComunidadComponent', () => {
  let component: ComunidadComponent;
  let fixture: ComponentFixture<ComunidadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComunidadComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ComunidadComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
