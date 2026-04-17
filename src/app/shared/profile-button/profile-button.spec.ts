import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileButtonComponent } from './profile-button';

describe('ProfileButtonComponent', () => {
  let component: ProfileButtonComponent;
  let fixture: ComponentFixture<ProfileButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileButtonComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
