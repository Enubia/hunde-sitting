import { Container } from 'inversify';

import { DatabaseProvider, DatabaseProviderSymbol } from '#db/databaseprovider.js';
import { DashboardRepository, DashboardRepositorySymbol, DashboardService, DashboardServiceSymbol } from '#routes/admin/dashboard/index.js';

const container = new Container();
// db
container.bind<DatabaseProvider>(DatabaseProviderSymbol).to(DatabaseProvider).inSingletonScope();

// repositories
container.bind<DashboardRepository>(DashboardRepositorySymbol).to(DashboardRepository).inSingletonScope();

// services
container.bind<DashboardService>(DashboardServiceSymbol).to(DashboardService);

// controllers are managed by hono routes

export default container;
