import { Index, IObject, ObjectRef } from "@modules/nw-db/nw-db.module";

import { Composite } from "./composite";
import { Materials } from "./materials";

export class Product extends Composite {
  constructor(ref: ObjectRef, index: Index<IObject>) {
    super(new Materials(), ref, index);
  }
}
