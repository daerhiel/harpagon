import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '@environments/environment';
import { buildUrl } from '@app/services/utilities';
import { Response } from './models/response';
import { SearchItem } from './models/search-item';

@Injectable({
  providedIn: 'root'
})
export class NwDbApiService {
  readonly #http: HttpClient = inject(HttpClient);
  readonly #url: string = environment.apiNwDbUrl;

  search(term: string): Observable<SearchItem[]> {
    return this.#http.get<Response<SearchItem[]>>(buildUrl(this.#url, 'db', ['search', term])).pipe(map(x => x.data));
  }
}
