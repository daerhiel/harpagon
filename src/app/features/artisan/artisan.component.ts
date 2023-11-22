import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input'
import { MatAutocompleteModule } from '@angular/material/autocomplete'
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, filter, map, switchMap, tap } from 'rxjs';

import { NwDbApiService, NwIconDirective, SearchRef } from '@modules/nw-db/nw-db.module';
import { ArtisanService } from '@modules/artisan/artisan.module';

@Component({
  selector: 'app-artisan',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, ReactiveFormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule, MatAutocompleteModule,
    MatButtonModule,
    MatIconModule,
    NwIconDirective
  ],
  templateUrl: './artisan.component.html',
  styleUrls: ['./artisan.component.scss']
})
export class ArtisanComponent {
  readonly #nwDbApi: NwDbApiService = inject(NwDbApiService);

  protected readonly itemNameFn = (item: SearchRef) => item?.name;
  protected readonly searchItem = new FormControl<string | SearchRef | null>(null);
  protected readonly searchItems = toSignal(this.searchItem.valueChanges.pipe(
    filter(term => typeof term === 'string' && term.length > 2), map(x => x as string),
    distinctUntilChanged(), debounceTime(300),
    switchMap(term => this.#nwDbApi.search(term).pipe(map(x => x.filter(v => v.type === 'recipe'))))
  ));

  protected readonly artisan: ArtisanService = inject(ArtisanService);
  protected readonly switch = toSignal(this.searchItem.valueChanges.pipe(
    filter(item => typeof item !== 'string' && item != null), map(x => x as SearchRef),
    distinctUntilChanged(), tap(() => this.searchItem.reset()), debounceTime(300),
    tap(recipe => this.artisan.load(recipe))
  ));

  protected columns: string[] = ['icon', 'name', 'formula', 'total', 'extra'];
}
