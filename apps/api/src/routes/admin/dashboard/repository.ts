import type { DatabaseProvider } from '#db/databaseprovider.js';

import { inject, injectable } from 'inversify';

import { DatabaseProviderSymbol } from '#db/databaseprovider.js';

export const DashboardRepositorySymbol = Symbol.for('DashboardRepository');

@injectable()
export class DashboardRepository {
    constructor(
        @inject(DatabaseProviderSymbol) private readonly provider: DatabaseProvider,
    ) {}

    getStats(limit?: string) {
        return this.provider.db
            .selectFrom('users')
            .innerJoin('sitters', 'users.id', 'sitters.user_id')
            .selectAll()
            .$if(!!limit, q => q.limit(Number.parseInt(limit!)))
            .execute();
    }
}
