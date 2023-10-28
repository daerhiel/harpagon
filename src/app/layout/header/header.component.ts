import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';

import { LayoutService } from '../layout.service';
import { TitleStrategyService } from '../title-strategy.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatToolbarModule, MatButtonModule, MatIconModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  protected readonly layout: LayoutService = inject(LayoutService);

  get title(): string { return TitleStrategyService.title; }
}
