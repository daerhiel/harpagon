import { Index, Object, ObjectRef } from "@modules/nw-db/nw-db.module";

import { Operation } from "./operation";

export class Product extends Operation {
  constructor(ref: ObjectRef, index: Index<Object>) {
    super(ref, index);
  }
}
