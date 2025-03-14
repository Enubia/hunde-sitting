import type { IDatabaseProvider } from './db/databaseprovider.js';
import type { IDashboardRepository } from '#repositories/dashboardrepository.js';

import { Container } from 'inversify';

import { DashboardRepository, DashboardRepositorySymbol } from '#repositories/dashboardrepository.js';

import DatabaseProvider, { DatabaseProviderSymbol } from './db/databaseprovider.js';

const container = new Container();
container.bind<IDatabaseProvider>(DatabaseProviderSymbol).to(DatabaseProvider).inSingletonScope();
container.bind<IDashboardRepository>(DashboardRepositorySymbol).to(DashboardRepository).inSingletonScope();
export default container;
