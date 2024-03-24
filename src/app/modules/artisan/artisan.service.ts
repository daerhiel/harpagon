import { Injectable, Injector, OnDestroy, Signal, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap, tap } from 'rxjs';

import { NwDbService, IEntity, ObjectRef, TradeSkill } from '@modules/nw-db/nw-db.module';
import { Subscriptions } from '@app/services/subscriptions';
import { getStorageItem, setStorageItem } from '@app/services/settings';
import { Equipment, Housing, Product, ProductState } from './artisan.module';

const ENTITY_PROPERTY_NAME = 'artisan.entity';
const SETTINGS_PROPERTY_NAME = 'artisan.settings';

export var __injector: Injector;

type Settings = {
  housing: Housing | undefined;
  arcana: Equipment | undefined;
  cooking: Equipment | undefined;
  woodworking: Equipment | undefined;
  leatherworking: Equipment | undefined;
  stonecutting: Equipment | undefined;
  smelting: Equipment | undefined;
  weaving: Equipment | undefined;
};

type SectionState<T extends Housing | Equipment> = ReturnType<T['getState']>;

type SettingsState = {
  [K in keyof Settings]?: SectionState<NonNullable<Settings[K]>>;
};

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
  ), { rejectErrors: true });
  readonly #state = computed(() => this.product()?.getState())
  readonly #stream = toObservable(this.#state).pipe();

  readonly #housingPipeline = this.#nwDb.getEquipment(...[
    { id: 'house_housingitem_buff_uber_crafting', type: 'item' }
  ] satisfies ObjectRef[]).pipe(map(objects =>
    new Housing('Cooking', ...objects).setState(this.settings.housing))
  );
  readonly #arcanaPipeline = this.#nwDb.getEquipment(...[
    { id: 'perkid_armor_jeweler', type: 'perk' }
  ] satisfies ObjectRef[]).pipe(map(objects =>
    new Equipment(this.housing, 'Arcana', 0, ...objects).setState(this.settings.arcana))
  );
  readonly #cookingPipeline = this.#nwDb.getEquipment(...[
    { id: 'perkid_armor_cook', type: 'perk' },
    { id: 'perkid_armor_cook_faction', type: 'perk' },
    { id: 'perkid_earring_cook', type: 'perk' }
  ] satisfies ObjectRef[]).pipe(map(objects =>
    new Equipment(this.housing, 'Cooking', 0, ...objects).setState(this.settings.cooking))
  );
  readonly #woodworkingPipeline = this.#nwDb.getEquipment(...[
    { id: 'perkid_armor_woodworkeryield', type: 'perk' }
  ] satisfies ObjectRef[]).pipe(map(objects =>
    new Equipment(this.housing, 'Woodworking', 0.05, ...objects).setState(this.settings.woodworking))
  );
  readonly #leatherworkingPipeline = this.#nwDb.getEquipment(...[
    { id: 'perkid_armor_leatherworkeryield', type: 'perk' }
  ] satisfies ObjectRef[]).pipe(map(objects =>
    new Equipment(this.housing, 'Leatherworking', 0.05, ...objects).setState(this.settings.leatherworking))
  );
  readonly #stonecuttingPipeline = this.#nwDb.getEquipment(...[
    { id: 'perkid_armor_stonecutteryield', type: 'perk' }
  ] satisfies ObjectRef[]).pipe(map(objects =>
    new Equipment(this.housing, 'Stonecutting', 0.05, ...objects).setState(this.settings.stonecutting))
  );
  readonly #smeltingPipeline = this.#nwDb.getEquipment(...[
    { id: 'perkid_armor_smelteryield', type: 'perk' }
  ] satisfies ObjectRef[]).pipe(map(objects =>
    new Equipment(this.housing, 'Smelting', 0.05, ...objects).setState(this.settings.smelting))
  );
  readonly #weavingPipeline = this.#nwDb.getEquipment(...[
    { id: 'perkid_armor_weaveryield', type: 'perk' }
  ] satisfies ObjectRef[]).pipe(map(objects =>
    new Equipment(this.housing, 'Weaving', 0.05, ...objects).setState(this.settings.weaving))
  );

  readonly housing = toSignal(this.#housingPipeline, { rejectErrors: true });
  readonly arcana = toSignal(this.#arcanaPipeline, { rejectErrors: true });
  readonly cooking = toSignal(this.#cookingPipeline, { rejectErrors: true });
  readonly woodworking = toSignal(this.#woodworkingPipeline, { rejectErrors: true });
  readonly leatherworking = toSignal(this.#leatherworkingPipeline, { rejectErrors: true });
  readonly stonecutting = toSignal(this.#stonecuttingPipeline, { rejectErrors: true });
  readonly smelting = toSignal(this.#smeltingPipeline, { rejectErrors: true });
  readonly weaving = toSignal(this.#weavingPipeline, { rejectErrors: true });

  readonly tradeSkills: Partial<Record<TradeSkill, Signal<Equipment | undefined>>> = {
    Arcana: this.arcana,
    Cooking: this.cooking,
    Woodworking: this.woodworking,
    Leatherworking: this.leatherworking,
    Stonecutting: this.stonecutting,
    Smelting: this.smelting,
    Weaving: this.weaving,
  } as const;

  protected readonly settings = getStorageItem<SettingsState>(SETTINGS_PROPERTY_NAME, {});

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

  saveSettings(): void {
    setStorageItem<SettingsState>(SETTINGS_PROPERTY_NAME, {
      housing: this.housing()?.getState(),
      arcana: this.arcana()?.getState(),
      cooking: this.cooking()?.getState(),
      woodworking: this.woodworking()?.getState(),
      leatherworking: this.leatherworking()?.getState(),
      stonecutting: this.stonecutting()?.getState(),
      smelting: this.smelting()?.getState(),
      weaving: this.weaving()?.getState(),
    })
  }
}
