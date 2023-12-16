import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

import { Product } from '@modules/artisan/artisan.module';
import { BuilderComponent } from '../builder/builder.component';

export type ExplainerData = {
  product: Product
}

@Component({
  selector: 'app-explainer',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    BuilderComponent,
  ],
  templateUrl: './explainer.component.html',
  styleUrl: './explainer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExplainerComponent {
  protected data: ExplainerData = inject(MAT_DIALOG_DATA);
}
