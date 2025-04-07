import { createApp } from '../src/lib/create-app';
import { registerRoutes } from '../src/routes';

// stand alone router type used for api client
const router = registerRoutes(createApp());
export type Router = typeof router;
export type OmitAbleWebRoutes = 'admin' | 'health';
