import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input'
import { MatAutocompleteModule } from '@angular/material/autocomplete'
import { toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, filter, map, switchMap, tap } from 'rxjs';

import { NwDbApiService, NwDbService, NwIconDirective, Recipe, SearchItem } from '@modules/nw-db/nw-db.module';
import { getStorageItem, setStorageItem } from '@app/services/settings';
import { MatIconModule } from '@angular/material/icon';

const RECIPE_PROPERTY_NAME = 'artisan.recipe';

@Component({
  selector: 'app-artisan',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule, MatAutocompleteModule,
    MatIconModule,
    NwIconDirective
  ],
  templateUrl: './artisan.component.html',
  styleUrls: ['./artisan.component.scss']
})
export class ArtisanComponent {
  readonly #nwDb: NwDbService = inject(NwDbService);
  readonly #nwDbApi: NwDbApiService = inject(NwDbApiService);

  protected readonly itemNameFn = (item: SearchItem) => item?.name;
  protected readonly searchItem = new FormControl<string | SearchItem | null>(null);
  protected readonly searchItems = toSignal(this.searchItem.valueChanges.pipe(
    filter(term => typeof term === 'string' && term.length > 2), map(x => x as string),
    distinctUntilChanged(), debounceTime(300),
    switchMap(term => this.#nwDbApi.search(term).pipe(map(x => x.filter(v => v.type === 'recipe'))))
  ));

  readonly #switch = toSignal(this.searchItem.valueChanges.pipe(
    filter(item => typeof item !== 'string' && item != null), map(x => x as SearchItem),
    distinctUntilChanged(), tap(() => this.searchItem.reset()), debounceTime(300),
    switchMap(item => this.#nwDbApi.getRecipe(item.id)),
    tap(recipe => (this.recipe.set(recipe), setStorageItem(RECIPE_PROPERTY_NAME, recipe)))
  ));

  protected readonly recipe = signal<Recipe | null>(getStorageItem(RECIPE_PROPERTY_NAME, null));
}
