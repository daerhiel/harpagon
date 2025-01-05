import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { GamingToolsService } from './gaming-tools.service';

describe('GamingToolsService', () => {
  let service: GamingToolsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(GamingToolsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
