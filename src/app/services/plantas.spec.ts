import { TestBed } from '@angular/core/testing';

import { Plantas } from './plantas';

describe('Plantas', () => {
  let service: Plantas;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Plantas);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
