import { ChangeDetectionStrategy, Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { NwIconDirective } from '@modules/nw-db/nw-db.module';
import { Composite, Entity, Product } from '@modules/artisan/artisan.module';
import { InstancePipe } from '@app/services/instance.pipe';

@Component({
  selector: 'app-planner',
  standalone: true,
  templateUrl: './planner.component.html',
  styleUrl: './planner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatTableModule,
    MatSlideToggleModule,
    MatIconModule,
    MatTooltipModule,
    NwIconDirective,
    InstancePipe
  ]
})
export class PlannerComponent {
  readonly #product = signal<Product | null>(null);

  protected readonly columns = ['step', 'action', 'switch', 'name', 'requested', 'effective', 'bonus', 'market-price', 'craft-price', 'cost', 'profit'];
  protected readonly Product = Product;
  protected readonly Composite = Composite;

  @Input()
  get product(): Product | null {
    return this.#product();
  }
  set product(value: Product | null) {
    this.#product.set(value);
  }

  protected readonly ingredients = computed(() => {
    const product = this.#product();
    const ingredients: Entity[] = [];
    if (product) {
      const traverse = (...objects: Entity[]) => {
        for (const object of objects) {
          if (object instanceof Composite && object.useCraft()) {
            traverse(...object.ingredients.map(x => x.entity));
          }
          if (!ingredients.includes(object)) {
            ingredients.push(object);
          }
        }
      }
      traverse(product);
    }
    return ingredients.sort((a, b) => b.score - a.score);
  })
}
