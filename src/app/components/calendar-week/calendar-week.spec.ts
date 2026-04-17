import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarWeekComponent } from './calendar-week';

describe('CalendarWeekComponent', () => {
  let component: CalendarWeekComponent;
  let fixture: ComponentFixture<CalendarWeekComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarWeekComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CalendarWeekComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
