import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

export * from './models/entity';
export * from './models/composite';
export * from './models/ingredient';
export * from './models/materials';
export * from './models/product';
export * from './models/equipment';
export * from './artisan.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class ArtisanModule { }
