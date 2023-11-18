import { Index, IObject, ObjectRef } from "@modules/nw-db/nw-db.module";
import { GamingToolsService } from "@modules/gaming-tools/gaming-tools.service";

import { Composite } from "./composite";

export class Product extends Composite {
  constructor(ref: ObjectRef, index: Index<IObject>) {
    super(ref, index);
  }
}
