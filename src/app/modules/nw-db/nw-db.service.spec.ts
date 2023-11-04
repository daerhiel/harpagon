import { TestBed } from '@angular/core/testing';

import { NwDbService } from './nw-db.service';

describe('NwDbService', () => {
  let service: NwDbService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NwDbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
