import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { tap } from 'rxjs';

import { NwIconDirective, ObjectRef } from '@modules/nw-db/nw-db.module';
import { Composite, Entity, Product } from '@modules/artisan/artisan.module';
import { Subscriptions } from '@app/services/subscriptions';
import { InstancePipe } from '@app/services/instance.pipe';

@Component({
  selector: 'entity',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatIconModule,
    MatTooltipModule,
    NwIconDirective,
    InstancePipe
  ],
  templateUrl: './entity.component.html',
  styleUrl: './entity.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntityComponent implements OnDestroy {
  readonly #subscriptions = new Subscriptions();

  protected readonly columns = ["quantity", "action", "price", "sign", "total"];
  protected readonly Product = Product;
  protected readonly Composite = Composite;

  protected readonly required = new FormControl<number | null>(null, Validators.pattern(/^\d+$/i));

  @Input()
  get data(): Entity | null {
    return this.#data;
  }
  set data(value: Entity | null) {
    if (value !== this.#data) {
      if (value instanceof Product) {
        const volume = value.requestedVolume();
        volume && this.required.setValue(volume);
      }
      this.#data = value;
    }
  }
  #data: Entity | null = null;

  @Output()
  readonly navigate = new EventEmitter<ObjectRef>();

  constructor() {
    this.#subscriptions.subscribe(this.required.valueChanges.pipe(tap(x => {
      if (this.data instanceof Product) {
        let value: number | undefined;
        if (typeof x === 'string' && !isNaN(parseInt(x))) {
          value = parseInt(x);
        }
        this.data.requestedVolume.set(value || 1);
      }
    })));
  }

  ngOnDestroy(): void {
    this.#subscriptions.unsubscribe();
  }
}
