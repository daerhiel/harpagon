import { ChangeDetectionStrategy, Component, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { LayoutService } from '@layout/layout.service';
import { TitleStrategyService } from '@layout/title-strategy.service';
import { HeaderComponent } from '@layout/header/header.component';
import { PortalComponent } from '@layout/portal/portal.component';
import { FooterComponent } from '@layout/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatSidenavModule, MatSnackBarModule,
    HeaderComponent, PortalComponent, FooterComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  readonly layout: LayoutService = inject(LayoutService)

  readonly title = TitleStrategyService.title;

  @ViewChild('sidenav')
  readonly sidenav?: MatSidenav;
}
