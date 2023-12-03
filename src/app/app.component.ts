import { ChangeDetectionStrategy, Component, OnDestroy, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { tap } from 'rxjs';

import { BroadcastService } from '@app/services/broadcast.service';
import { MessageType } from '@app/services/broadcast/message-type';
import { Subscriptions } from '@app/services/subscriptions';
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
export class AppComponent implements OnDestroy {
  readonly #subscriptions: Subscriptions = new Subscriptions();
  readonly #broadcast: BroadcastService = inject(BroadcastService);
  readonly #snackBar: MatSnackBar = inject(MatSnackBar);
  readonly layout: LayoutService = inject(LayoutService);

  readonly title = TitleStrategyService.title;

  @ViewChild('sidenav')
  readonly sidenav?: MatSidenav;

  constructor() {
    this.#subscriptions.subscribe(this.#broadcast.stream$.pipe(tap(message => {
      this.#snackBar.open(message.text, 'Dismiss', {
        duration: message.timeout, horizontalPosition: 'right', verticalPosition: 'bottom',
        panelClass: MessageType[message.type].toLocaleLowerCase()
      });
    })));
  }

  ngOnDestroy(): void {
    this.#subscriptions.unsubscribe();
  }
}
