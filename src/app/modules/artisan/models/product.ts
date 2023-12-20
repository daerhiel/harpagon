import { Index, IObject, ObjectRef } from "@modules/nw-db/nw-db.module";
import { signal } from "@angular/core";

import { Composite, CompositeState } from "./composite";
import { Materials } from "./materials";

export interface ProductState extends CompositeState {
  id: string
  recipeId: string
}

export class Product extends Composite {
  override readonly requestedVolume = signal(1);

  constructor(ref: ObjectRef, index: Index<IObject>) {
    super(new Materials(), ref, index);
    this.useCraft.set(true);
  }

  override getState(): ProductState {
    return {
      id: this.id,
      recipeId: this.recipeId,
      ...super.getState()
    };
  }

  override setState(state: ProductState) {
    if (state && state.recipeId == this.recipeId) {
      super.setState(state);
    }
  }
}
