import { HttpHandler } from 'msw';
import authHandler from './auth/loggedInHandler';
import resourceHandler from './resources/baseSampleHandler';

export const handlers: HttpHandler[] = [...authHandler, ...resourceHandler];
