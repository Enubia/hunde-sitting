import { Container } from 'inversify';

import { DashboardRepository, DashboardRepositorySymbol } from '#admin/dashboard/dashboardrepository.js';
import { DashboardService, DashboardServiceSymbol } from '#admin/dashboard/dashboardservice.js';
import { DatabaseProvider, DatabaseProviderSymbol } from '#db/databaseprovider.js';

const container = new Container();
// db
container.bind<DatabaseProvider>(DatabaseProviderSymbol).to(DatabaseProvider).inSingletonScope();

// repositories
container.bind<DashboardRepository>(DashboardRepositorySymbol).to(DashboardRepository).inSingletonScope();

// services
container.bind<DashboardService>(DashboardServiceSymbol).to(DashboardService);

// controllers are managed by hono routes

export default container;
