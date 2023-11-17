import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, of } from 'rxjs';

import { environment } from '@environments/environment';
import { buildUrl } from '@app/services/utilities';
import { Response } from './models/response';
import { IRecipe } from './models/objects';
import { IObject, ObjectRef, SearchRef } from './models/types';

@Injectable({
  providedIn: 'root'
})
export class NwDbApiService {
  readonly #http: HttpClient = inject(HttpClient);
  readonly #url: string = environment.apiNwDbUrl;

  search(term: string): Observable<SearchRef[]> {
    return this.#http.get<Response<SearchRef[]>>(buildUrl(this.#url, 'db', ['search', term])).pipe(map(x => x.data));
  }

  getObject<T extends IObject>(ref: ObjectRef | null): Observable<T | null> {
    return ref ? this.#http.get<Response<T>>(buildUrl(this.#url, 'db', [ref.type, `${ref.id}.json`])).pipe(map(x => x.data)) : of(null);
  }

  getRecipe(id: string): Observable<IRecipe> {
    return this.#http.get<Response<IRecipe>>(buildUrl(this.#url, 'db', ['recipe', `${id}.json`])).pipe(map(x => x.data));
  }
}
