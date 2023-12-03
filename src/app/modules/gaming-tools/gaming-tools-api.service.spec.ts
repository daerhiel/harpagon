import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { GamingToolsApiService } from './gaming-tools-api.service';

describe('GamingToolsApiService', () => {
  let service: GamingToolsApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ]
    });
    service = TestBed.inject(GamingToolsApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
