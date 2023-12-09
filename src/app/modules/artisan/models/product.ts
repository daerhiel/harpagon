import { Index, IObject, ObjectRef } from "@modules/nw-db/nw-db.module";
import { signal, Signal } from "@angular/core";

import { Composite, CompositeState } from "./composite";
import { Materials } from "./materials";

export interface ProductState extends CompositeState {
  id: string
}

export class Product extends Composite {
  override readonly requestedVolume: Signal<number> = signal(1);

  constructor(ref: ObjectRef, index: Index<IObject>) {
    super(new Materials(), ref, index);
    this.useCraft.set(true);
  }

  override getState(): ProductState {
    return {
      id: this.id,
      ...super.getState()
    };
  }
}
