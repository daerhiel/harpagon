import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { NwDbService } from './nw-db.service';

describe('NwDbService', () => {
  let service: NwDbService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(NwDbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
