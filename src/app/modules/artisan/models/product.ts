import { Index, IObject, ObjectRef } from "@modules/nw-db/nw-db.module";

import { Composite, CompositeState } from "./composite";
import { Materials } from "./materials";

export interface ProductState extends CompositeState {
  id: string
}

export class Product extends Composite {
  constructor(ref: ObjectRef, index: Index<IObject>) {
    super(new Materials(), ref, index);
    this.expand.set(true);
  }

  override getState(): ProductState {
    return {
      id: this.id,
      ...super.getState()
    };
  }
}
