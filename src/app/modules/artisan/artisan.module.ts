import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

export * from './models/product';
export * from './artisan.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class ArtisanModule { }