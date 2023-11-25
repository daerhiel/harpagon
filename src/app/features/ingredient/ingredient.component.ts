import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { NwIconDirective, ObjectRef } from '@modules/nw-db/nw-db.module';
import { Ingredient } from '@modules/artisan/artisan.module';

@Component({
  selector: 'ingredient',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    NwIconDirective
  ],
  templateUrl: './ingredient.component.html',
  styleUrl: './ingredient.component.scss'
})
export class IngredientComponent {
  @Input()
  data: Ingredient | null = null;

  @Output()
  readonly navigate = new EventEmitter<ObjectRef>();
}
