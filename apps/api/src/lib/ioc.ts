import { Container } from 'inversify';

import { DatabaseProvider, DatabaseProviderSymbol } from '#db/databaseprovider.js';
import { DashboardRepository, DashboardRepositorySymbol } from '#repositories/dashboardrepository.js';
import { DashboardService, DashboardServiceSymbol } from '#services/dashboardservice.js';

const container = new Container();
// db
container.bind<DatabaseProvider>(DatabaseProviderSymbol).to(DatabaseProvider).inSingletonScope();

// repositories
container.bind<DashboardRepository>(DashboardRepositorySymbol).to(DashboardRepository).inSingletonScope();

// services
container.bind<DashboardService>(DashboardServiceSymbol).to(DashboardService).inSingletonScope();

// controllers are managed by hono routes

export default container;
