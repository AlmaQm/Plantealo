import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileButton } from './profile-button';

describe('ProfileButton', () => {
  let component: ProfileButton;
  let fixture: ComponentFixture<ProfileButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileButton],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileButton);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
