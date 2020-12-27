import { TestBed } from '@angular/core/testing';

import { HrvService } from './hrv.service';

describe('HrvService', () => {
  let service: HrvService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HrvService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
