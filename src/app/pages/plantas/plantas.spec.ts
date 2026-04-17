import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantasComponent } from './plantas';

describe('PlantasComponent', () => {
  let component: PlantasComponent;
  let fixture: ComponentFixture<PlantasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlantasComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PlantasComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
