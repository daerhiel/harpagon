import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { GamingToolsService } from '@modules/gaming-tools/gaming-tools.module';
import { SettingsComponent } from '@features/settings/settings.component';
import { LayoutService } from '../layout.service';
import { TitleStrategyService } from '../title-strategy.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatToolbarModule, MatMenuModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  readonly #dialog: MatDialog = inject(MatDialog);

  protected readonly layout: LayoutService = inject(LayoutService);
  protected readonly gaming: GamingToolsService = inject(GamingToolsService);

  get title(): string { return TitleStrategyService.title; }

  setup(): void {
    this.#dialog.open(SettingsComponent, {
      data: {},
      position: { }, maxWidth: '95vw', maxHeight: '84vh'
    });
  }
}
