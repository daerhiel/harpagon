import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

export * from './models/response';
export * from './models/base-item';
export * from './models/search-item';
export * from './nw-db-api.service';
export * from './nw-db.service';
export * from './nw-icon.pipe';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class NwDbModule { }
