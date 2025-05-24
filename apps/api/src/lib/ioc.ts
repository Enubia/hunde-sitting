import { Container } from 'inversify';

import { DatabaseProvider, DatabaseProviderSymbol } from '#db/databaseprovider.js';
import { DashboardRepository, DashboardRepositorySymbol } from '#routes/admin/dashboard/repository.js';
import { DashboardService, DashboardServiceSymbol } from '#routes/admin/dashboard/service.js';

import CacheService, { CacheServiceSymbol } from './cacheservice.js';

const container = new Container();
// db
container.bind<DatabaseProvider>(DatabaseProviderSymbol).to(DatabaseProvider).inSingletonScope();

// cache
container.bind<CacheService>(CacheServiceSymbol).to(CacheService).inSingletonScope();

// repositories
container.bind<DashboardRepository>(DashboardRepositorySymbol).to(DashboardRepository).inSingletonScope();

// services
container.bind<DashboardService>(DashboardServiceSymbol).to(DashboardService);

// controllers are managed by hono routes

export default container;
