import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input'
import { MatAutocompleteModule } from '@angular/material/autocomplete'
import { toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, filter, map, switchMap } from 'rxjs';

import { NwDbApiService, NwDbService, SearchItem } from '@app/modules/nw-db/nw-db.module';
import { MatIconModule } from '@angular/material/icon';
import { NwIconPipe } from '@app/modules/nw-db/nw-icon.pipe';
import { IsPipe } from '@app/services/is.pipe';

@Component({
  selector: 'app-artisan',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule, MatAutocompleteModule,
    MatIconModule,
    NwIconPipe, IsPipe
  ],
  templateUrl: './artisan.component.html',
  styleUrls: ['./artisan.component.scss']
})
export class ArtisanComponent {
  readonly #nwDb: NwDbService = inject(NwDbService);
  readonly #nwDbApi: NwDbApiService = inject(NwDbApiService);

  protected readonly item = new FormControl<string | SearchItem>('');
  protected readonly items = toSignal(this.item.valueChanges.pipe(
    distinctUntilChanged(), debounceTime(300),
    filter(term => typeof term === 'string' && term.length > 2),
    switchMap(term => this.#nwDbApi.search(term as string)
      .pipe(map(x => x.filter(v => v.type === 'recipe')))
    )
  ));

  protected readonly itemNameFn = (item: SearchItem) => item.name;
}
