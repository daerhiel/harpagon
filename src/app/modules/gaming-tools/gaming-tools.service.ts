import { Injectable, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

import { getStorageItem, setStorageItem } from '@app/services/settings';
import { GamingToolsApiService } from './gaming-tools-api.service';
import { GameServer } from './models/game-server';
import { filter, mergeMap } from 'rxjs';

export const GAME_SERVER_PROPERTY_NAME = 'game.server';

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
    mergeMap(domain => this.#api.getServerPrices(domain!.name))
  ));

  setServer(server: GameServer): void {
    this.#domain.set(server);
    setStorageItem(GAME_SERVER_PROPERTY_NAME, this.#domain());
  }
}
