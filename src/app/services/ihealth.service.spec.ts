import { TestBed } from '@angular/core/testing';

import { IhealthService } from './ihealth.service';

describe('IhealthService', () => {
  let service: IhealthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IhealthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
