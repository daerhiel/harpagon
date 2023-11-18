import { Injectable, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { filter, map, mergeMap } from 'rxjs';

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

  readonly servers = toSignal(this.#api.getServers());

  readonly #domain = signal<GameServer | null>(getStorageItem(GAME_SERVER_PROPERTY_NAME, null));
  readonly domain = this.#domain.asReadonly();

  readonly commodities = toSignal(toObservable(this.#domain).pipe(
    filter(domain => !!domain),
    mergeMap(domain => this.#api.getServerPrices(domain!.name).pipe(map(x => index(x))))
  ));

  setServer(server: GameServer): void {
    this.#domain.set(server);
    setStorageItem(GAME_SERVER_PROPERTY_NAME, this.#domain());
  }
}
