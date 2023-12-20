import { ChangeDetectionStrategy, Component, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input'
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete'
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, filter, map, switchMap, tap } from 'rxjs';

import { NwDbService, NwIconDirective, ObjectRef, SearchRef } from '@modules/nw-db/nw-db.module';
import { ArtisanService, Product } from '@modules/artisan/artisan.module';
import { PlannerComponent } from '../planner/planner.component';
import { ExplainerComponent } from '../explainer/explainer.component';
import { Subscriptions } from '@app/services/subscriptions';

@Component({
  selector: 'app-artisan',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, ReactiveFormsModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule, MatAutocompleteModule,
    MatButtonModule,
    MatIconModule,
    NwIconDirective,
    PlannerComponent
  ],
  templateUrl: './artisan.component.html',
  styleUrls: ['./artisan.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArtisanComponent implements OnDestroy {
  readonly #subscriptions = new Subscriptions();
  readonly #nwDb: NwDbService = inject(NwDbService);
  readonly #dialog: MatDialog = inject(MatDialog);

  protected readonly itemNameFn = (item: SearchRef) => item?.name;
  protected readonly searchItem = new FormControl<string | ObjectRef | null>(null);
  protected readonly searchItems = toSignal(this.searchItem.valueChanges.pipe(
    filter(term => typeof term === 'string' && term.length > 2), map(x => x as string),
    distinctUntilChanged(), debounceTime(300),
    switchMap(term => this.#nwDb.search(term).pipe(map(x => x.filter(v => v.type === 'recipe'))))
  ));
  protected readonly required = new FormControl<number | null>(null);

  protected readonly artisan: ArtisanService = inject(ArtisanService);
  protected readonly switch = toSignal(this.searchItem.valueChanges.pipe(
    filter(item => typeof item !== 'string' && item != null), map(x => x as SearchRef),
    distinctUntilChanged(),
    tap(entity => this.artisan.load(entity))
  ));

  constructor() {
    this.#subscriptions.subscribe(this.required.valueChanges.pipe(tap(x => {
      const product = this.artisan.product();
      if (product instanceof Product) {
        let value: number | undefined;
        if (typeof x === 'string' && !isNaN(parseInt(x))) {
          value = parseInt(x);
        }
        product.requestedVolume.set(value || 1);
      }
    })));
  }

  ngOnDestroy(): void {
    this.#subscriptions.unsubscribe();
  }

  protected change(event: MatAutocompleteSelectedEvent) {
    this.searchItem.reset();
    this.required.reset();
  }

  protected explain(product: Product): void {
    this.#dialog.open(ExplainerComponent, {
      data: { product },
      enterAnimationDuration: 0, exitAnimationDuration: 0,
      position: { top: '9rem' }, maxWidth: '95vw', maxHeight: '84vh'
    });
  }
}
