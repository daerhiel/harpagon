import { Directive, ElementRef, inject } from '@angular/core';
import { EntityComponent } from '../entity/entity.component';

@Directive({
  selector: 'entity[ingredient]',
  standalone: true
})
export class IngredientDirective {
  readonly #ref: ElementRef<HTMLElement> = inject(ElementRef);
  readonly #host: EntityComponent = inject(EntityComponent);

  get element(): HTMLElement { return this.#ref.nativeElement; }
  get host(): EntityComponent { return this.#host; }
}
