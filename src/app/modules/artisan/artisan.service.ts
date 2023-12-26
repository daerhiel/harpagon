import { Injectable, Injector, OnDestroy, Signal, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap, tap } from 'rxjs';

import { NwDbService, IEntity, ObjectRef, TradeSkill } from '@modules/nw-db/nw-db.module';
import { Subscriptions } from '@app/services/subscriptions';
import { getStorageItem, setStorageItem } from '@app/services/settings';
import { Equipment, Product, ProductState } from './artisan.module';

const ENTITY_PROPERTY_NAME = 'artisan.entity';

export var __injector: Injector;

@Injectable({
  providedIn: 'root'
})
export class ArtisanService implements OnDestroy {
  readonly #subscriptions: Subscriptions = new Subscriptions();
  readonly #nwDb: NwDbService = inject(NwDbService);

  readonly #entity = signal(getStorageItem<IEntity | null>(ENTITY_PROPERTY_NAME, null));
  readonly entity = this.#entity.asReadonly();

  readonly #loading = signal(false);
  readonly #pipeline = toObservable(this.#entity).pipe(
    tap(() => this.#loading.set(true)),
    switchMap(ref => this.#nwDb.getHierarchy(ref!)),
    tap(() => this.#loading.set(false))
  );

  readonly loading = this.#loading.asReadonly();
  readonly product = toSignal(this.#pipeline.pipe(
    map(({ ref, index }) => {
      let product: Product | null = null;
      if (ref) {
        product = new Product(ref, index);
        const state = getStorageItem<ProductState | null>(`state:${product.recipeId}`, null);
        if (state) {
          product.setState(state);
        }
      }
      return product;
    })
  ));
  readonly #state = computed(() => this.product()?.getState())
  readonly #stream = toObservable(this.#state).pipe();

  readonly #arcanaPipeline = this.#nwDb.getEquipment(...[
  ] satisfies ObjectRef[]).pipe(map(objects =>
    new Equipment('Arcana', 0, ...objects))
  );
  readonly #cookingPipeline = this.#nwDb.getEquipment(...[
    { id: 'perkid_armor_cook', type: 'perk' },
    { id: 'perkid_armor_cook_faction', type: 'perk' },
    { id: 'perkid_earring_cook', type: 'perk' },
    { id: 'house_housingitem_buff_uber_crafting', type: 'item' }
  ] satisfies ObjectRef[]).pipe(map(objects =>
    new Equipment('Cooking', 0, ...objects))
  );
  readonly #woodworkingPipeline = this.#nwDb.getEquipment(...[
    { id: 'perkid_armor_woodworkeryield', type: 'perk' }
  ] satisfies ObjectRef[]).pipe(map(objects =>
    new Equipment('Woodworking', 0.05, ...objects))
  );
  readonly #leatherworkingPipeline = this.#nwDb.getEquipment(...[
    { id: 'perkid_armor_leatherworkeryield', type: 'perk' }
  ] satisfies ObjectRef[]).pipe(map(objects =>
    new Equipment('Leatherworking', 0.05, ...objects))
  );
  readonly #stonecuttingPipeline = this.#nwDb.getEquipment(...[
    { id: 'perkid_armor_stonecutteryield', type: 'perk' }
  ] satisfies ObjectRef[]).pipe(map(objects =>
    new Equipment('Stonecutting', 0.05, ...objects))
  );
  readonly #smeltingPipeline = this.#nwDb.getEquipment(...[
    { id: 'perkid_armor_smelteryield', type: 'perk' }
  ] satisfies ObjectRef[]).pipe(map(objects =>
    new Equipment('Smelting', 0.05, ...objects))
  );
  readonly #weavingPipeline = this.#nwDb.getEquipment(...[
    { id: 'perkid_armor_weaveryield', type: 'perk' }
  ] satisfies ObjectRef[]).pipe(map(objects =>
    new Equipment('Weaving', 0.05, ...objects))
  );

  readonly arcana = toSignal(this.#arcanaPipeline);
  readonly cooking = toSignal(this.#cookingPipeline);
  readonly woodworking = toSignal(this.#woodworkingPipeline);
  readonly leatherworking = toSignal(this.#leatherworkingPipeline);
  readonly stonecutting = toSignal(this.#stonecuttingPipeline);
  readonly smelting = toSignal(this.#smeltingPipeline);
  readonly weaving = toSignal(this.#weavingPipeline);

  readonly tradeSkills: Partial<Record<TradeSkill, Signal<Equipment | undefined>>> = {
    Arcana: this.arcana,
    Cooking: this.cooking,
    Woodworking: this.woodworking,
    Leatherworking: this.leatherworking,
    Stonecutting: this.stonecutting,
    Smelting: this.smelting,
    Weaving: this.weaving,
  } as const;

  constructor(injector: Injector) {
    __injector = injector;
    this.#subscriptions.subscribe(this.#stream.pipe(tap(state => {
      if (state) {
        setStorageItem(`state:${state.recipeId}`, state);
      }
    })));
  }

  ngOnDestroy(): void {
    this.#subscriptions.unsubscribe();
  }

  load(entity: IEntity): void {
    this.#entity.set(entity);
    setStorageItem(ENTITY_PROPERTY_NAME, entity);
  }
}
