import { Routes } from '@angular/router';
import { Home } from './internal/home';
import { HomePage } from '@ht/home/feature-landing/internal/pages/home';
import { AboutPage } from './internal/pages/about';
import { HelpPage } from './internal/pages/help';

export const homeLandingFeatureRoutes: Routes = [
  {
    path: '',
    component: Home,
    children: [
      {
        path: '',
        component: HomePage,
      },
      {
        path: 'about',
        component: AboutPage,
      },
      {
        path: 'help',
        component: HelpPage,
      },
    ],
  },
];
