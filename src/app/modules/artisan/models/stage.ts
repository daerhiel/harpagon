import { signal } from "@angular/core";

import { Entity } from "./entity";
import { Materials } from "./materials";

export class Stage {
  readonly #index = signal(new Set<Entity>());
  #next: Stage | null = null;
  #prev: Stage | null = null;

  readonly objects = this.#index.asReadonly();

  get next(): Stage | null { return this.#next; }
  get prev(): Stage | null { return this.#prev; }

  constructor(private readonly parent: Materials, readonly name: string) {
    parent.stages[name] = this;
  }

  has(value: Entity): boolean {
    return value && this.#index().has(value);
  }

  push(prev: Entity): void {
    prev && this.#index.update(objects => objects.add(prev));
  }

  getNext(): Stage {
    if (!this.#next) {
      const [_, id] = /^\w+(?:-(\d+))?$/i.exec(this.name)!;
      const name = `stage-${(id != null ? Number(id) : 0) + 1}`;
      this.#next = new Stage(this.parent, name);
    }
    return this.#next;
  }
}
