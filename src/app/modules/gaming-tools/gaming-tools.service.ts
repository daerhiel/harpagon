import { Injectable, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Observable, catchError, filter, map, mergeMap, of } from 'rxjs';

import { BroadcastService } from '@app/services/broadcast.service';
import { getStorageItem, setStorageItem } from '@app/services/settings';
import { GamingToolsApiService } from './gaming-tools-api.service';
import { GameServer } from './models/game-server';
import { Commodity, CommodityIndex } from './models/commodity';

export const GAME_SERVER_PROPERTY_NAME = 'game.server';

function index(commodities: Commodity[]): CommodityIndex {
  const index: CommodityIndex = {};
  for (const commodity of commodities) {
    index[commodity.id] = commodity.price;
  }
  return index;
}

@Injectable({
  providedIn: 'root'
})
export class GamingToolsService {
  readonly #api: GamingToolsApiService = inject(GamingToolsApiService);
  readonly #broadcast: BroadcastService = inject(BroadcastService);

  readonly servers = toSignal(this.#api.getServers().pipe(catchError(this.handleError([]))));

  readonly #domain = signal<GameServer | null>(getStorageItem(GAME_SERVER_PROPERTY_NAME, null));
  readonly domain = this.#domain.asReadonly();

  readonly commodities = toSignal(toObservable(this.#domain).pipe(
    filter(domain => !!domain),
    mergeMap(domain => this.#api.getServerPrices(domain!.name).pipe(map(x => index(x)))
      .pipe(catchError(this.handleError(undefined))))
  ));

  private handleError<T>(fallback: T): (e: HttpErrorResponse) => Observable<T> {
    return (e: HttpErrorResponse): Observable<T> => {
      this.#broadcast.exception(e);
      return of(fallback);
    }
  }

  setServer(server: GameServer): void {
    this.#domain.set(server);
    setStorageItem(GAME_SERVER_PROPERTY_NAME, this.#domain());
  }
}
