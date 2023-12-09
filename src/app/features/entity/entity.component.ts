import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { NwIconDirective, ObjectRef } from '@modules/nw-db/nw-db.module';
import { Composite, Entity } from '@modules/artisan/artisan.module';
import { InstancePipe } from '@app/services/instance.pipe';

@Component({
  selector: 'entity',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatIconModule,
    MatTooltipModule,
    NwIconDirective,
    InstancePipe
  ],
  templateUrl: './entity.component.html',
  styleUrl: './entity.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntityComponent {
  protected readonly columns = ["quantity", "action", "price", "sign", "total"];
  protected readonly Composite = Composite;

  @Input()
  data: Entity | null = null;

  @Output()
  readonly navigate = new EventEmitter<ObjectRef>();
}
