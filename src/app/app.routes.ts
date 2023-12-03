import { Routes } from '@angular/router';

import { TitleResolverService } from '@layout/title-resolver.service';

export const routes: Routes = [
  {
    path: '', title: TitleResolverService, children: [
      { path: '', loadComponent: () => import('@features/artisan/artisan.component').then(m => m.ArtisanComponent), title: 'Artisan' },
    ]
  },
  { path: 'code', redirectTo: '', pathMatch: 'prefix' }
];
