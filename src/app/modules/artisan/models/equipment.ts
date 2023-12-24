import { IObject, TradeSkill } from "@app/modules/nw-db/nw-db.module";

export class Equipment {
  constructor(readonly skill: TradeSkill, ...objects: IObject[]) {
    debugger
  }
}
