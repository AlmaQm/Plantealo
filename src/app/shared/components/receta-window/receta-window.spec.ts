import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecetaWindow } from './receta-window';

describe('RecetaWindow', () => {
  let component: RecetaWindow;
  let fixture: ComponentFixture<RecetaWindow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecetaWindow],
    }).compileComponents();

    fixture = TestBed.createComponent(RecetaWindow);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
