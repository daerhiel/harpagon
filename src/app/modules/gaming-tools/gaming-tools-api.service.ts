import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '@environments/environment';
import { buildUrl } from '@app/services/utilities';
import { GameServer } from './models/game-server';
import { Commodity } from './models/commodity';

@Injectable({
  providedIn: 'root'
})
export class GamingToolsApiService {
  readonly #http: HttpClient = inject(HttpClient);
  readonly #url: string = environment.apiGamingToolsUrl;

  getServers(): Observable<GameServer[]> {
    return this.#http.get<GameServer[]>(buildUrl(this.#url, 'prices', ['nwmp', 'servers']));
  }

  getServerPrices(serverName: string): Observable<Commodity[]> {
    return this.#http.get<Commodity[]>(buildUrl(this.#url, 'prices', ['nwmp'], { serverName }));
  }
}
