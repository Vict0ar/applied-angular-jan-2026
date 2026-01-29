import { Routes } from '@angular/router';

import { HomePage } from './internal/pages/home';
import { Home } from './internal/home';
import { DetailsPage } from './internal/pages/details';

export const linksFeatureRoutes: Routes = [
  {
    path: '',
    providers: [],
    component: Home,
    children: [
      {
        path: '',
        component: HomePage,
      },
      {
        path: 'details/:id',
        component: DetailsPage,
      },
    ],
  },
];
