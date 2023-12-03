import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TitleStrategy, provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

import { TitleStrategyService } from '@layout/title-strategy.service';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([])),
    provideRouter(routes), provideAnimations(),
    { provide: TitleStrategy, useClass: TitleStrategyService }
  ]
};
