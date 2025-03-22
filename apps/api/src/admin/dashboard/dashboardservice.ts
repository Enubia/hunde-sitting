import type { DashboardRepository } from '#admin/dashboard/dashboardrepository.js';
import type { RequestLog } from '#lib/logger/loggerfactory.js';

import { inject, injectable } from 'inversify';

import { DashboardRepositorySymbol } from '#admin/dashboard/dashboardrepository.js';

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
