import { TestBed } from '@angular/core/testing';

import { NwDbApiService } from './nw-db-api.service';

describe('NwDbApiService', () => {
  let service: NwDbApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NwDbApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
