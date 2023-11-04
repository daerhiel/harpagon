import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

export * from './models/response';
export * from './models/types';
export * from './models/objects';
export * from './models/search';
export * from './nw-db-api.service';
export * from './nw-db.service';
export * from './nw-icon.directive';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class NwDbModule { }
