import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';

import { NwIconDirective, ObjectRef } from '@modules/nw-db/nw-db.module';
import { Composite, Entity } from '@modules/artisan/artisan.module';
import { InstancePipe } from '@app/services/instance.pipe';

@Component({
  selector: 'entity',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatIconModule,
    NwIconDirective,
    InstancePipe
 ],
  templateUrl: './entity.component.html',
  styleUrl: './entity.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntityComponent {
  @Input()
  data: Entity | null = null;

  protected readonly Composite = Composite;

  @Output()
  readonly navigate = new EventEmitter<ObjectRef>();
}
