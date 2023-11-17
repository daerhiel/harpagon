import { Index, IObject, ObjectRef } from "@modules/nw-db/nw-db.module";

import { Operation } from "./operation";

export class Product extends Operation {
  constructor(ref: ObjectRef, index: Index<IObject>) {
    super(ref, index);
  }
}
