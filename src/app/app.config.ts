import { ApplicationConfig } from '@angular/core';
import { TitleStrategy, provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

import { TitleStrategyService } from '@layout/title-strategy.service';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), provideAnimations(),
    { provide: TitleStrategy, useClass: TitleStrategyService }
  ]
};
