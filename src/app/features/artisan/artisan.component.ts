import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input'
import { MatAutocompleteModule } from '@angular/material/autocomplete'
import { MatIconModule } from '@angular/material/icon';
import { toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, filter, map, switchMap, tap } from 'rxjs';

import { NwDbApiService, NwIconDirective, SearchItem } from '@modules/nw-db/nw-db.module';
import { ArtisanService } from '@modules/artisan/artisan.module';

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
    tap(recipe => this.artisan.load(recipe))
  ));

  protected readonly artisan: ArtisanService = inject(ArtisanService);
}
