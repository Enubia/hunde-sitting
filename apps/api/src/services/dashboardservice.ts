import type { DashboardRepository } from '#repositories/dashboardrepository.js';

import { inject, injectable } from 'inversify';

import { DashboardRepositorySymbol } from '#repositories/dashboardrepository.js';

export const DashboardServiceSymbol = Symbol.for('DashboardHandler');

@injectable()
export class DashboardService {
    constructor(
        @inject(DashboardRepositorySymbol)
        private readonly repository: DashboardRepository,
    ) {}

    async getDashboardData(limit?: string) {
        const data = await this.repository.getStats(limit);

        return data;
    }
}
