import { Injectable, inject } from '@angular/core';

import { NwDbApiService } from './nw-db-api.service';

@Injectable({
  providedIn: 'root'
})
export class NwDbService {
  readonly #api: NwDbApiService = inject(NwDbApiService);
}
