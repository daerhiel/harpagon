import { Directive, ElementRef, inject } from '@angular/core';
import { EntityComponent } from '../entity/entity.component';

@Directive({
  selector: 'entity[component]',
  standalone: true
})
export class ComponentDirective {
  readonly #ref: ElementRef<HTMLElement> = inject(ElementRef);
  readonly #host: EntityComponent = inject(EntityComponent);

  get id(): string | null { return this.#host.data?.id ?? null; }
  get element(): HTMLElement { return this.#ref.nativeElement; }
  get host(): EntityComponent { return this.#host; }
}
