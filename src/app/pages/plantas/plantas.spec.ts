import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Plantas } from './plantas';

describe('Plantas', () => {
  let component: Plantas;
  let fixture: ComponentFixture<Plantas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Plantas],
    }).compileComponents();

    fixture = TestBed.createComponent(Plantas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
