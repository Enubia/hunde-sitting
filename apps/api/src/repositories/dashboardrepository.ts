import type { IDatabaseProvider } from '#db/databaseprovider.js';

import { inject, injectable } from 'inversify';

import { DatabaseProviderSymbol } from '#db/databaseprovider.js';

export const DashboardRepositorySymbol = Symbol('DashboardRepository');

export interface IDashboardRepository {
    getStats: () => Promise<Record<string, unknown>[]>;
}

@injectable()
export class DashboardRepository implements IDashboardRepository {
    constructor(
        @inject(DatabaseProviderSymbol)
        private readonly provider: IDatabaseProvider,
    ) {
    }

    async getStats() {
        return await this.provider.db
            .selectFrom('users')
            .innerJoin('sitters', 'users.id', 'sitters.user_id')
            .selectAll()
            .execute();
    }
}
