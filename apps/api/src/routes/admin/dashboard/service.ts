import type CacheService from '#lib/cacheservice.js';
import type { RequestLog } from '#lib/logger/logmanager.js';

import type { DashboardRepository } from './repository.js';

import { inject, injectable } from 'inversify';

import { CacheServiceSymbol } from '#lib/cacheservice.js';

import { DashboardRepositorySymbol } from './repository.js';

export const DashboardServiceSymbol = Symbol.for('DashboardHandler');

@injectable()
export class DashboardService {
    constructor(
        @inject(DashboardRepositorySymbol) private readonly repository: DashboardRepository,
        @inject(CacheServiceSymbol) private readonly cache: CacheService,
    ) {}

    async getDashboardData(requestLog: RequestLog, limit?: string) {
        requestLog.debug('Fetching dashboard data', { limit });

        const data = await this.repository.getStats(limit);

        this.cache.set('dashboardData', data);

        return data;
    }
}
