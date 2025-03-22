import type { RequestLog } from '#lib/logger/loggerfactory.js';

import type { DashboardRepository } from './repository.js';

import { inject, injectable } from 'inversify';

import { DashboardRepositorySymbol } from './repository.js';

export const DashboardServiceSymbol = Symbol.for('DashboardHandler');

@injectable()
export class DashboardService {
    constructor(
        @inject(DashboardRepositorySymbol)
        private readonly repository: DashboardRepository,
    ) {}

    async getDashboardData(requestLog: RequestLog, limit?: string) {
        requestLog.debug('Fetching dashboard data', { limit });

        const data = await this.repository.getStats(limit);

        return data;
    }
}
