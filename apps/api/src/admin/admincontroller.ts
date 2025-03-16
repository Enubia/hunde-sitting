import createRouter from '#lib/create-router.js';

import dashboardcontroller from './dashboard/dashboardcontroller.js';

const router = createRouter()
    .route('/dashboard-data', dashboardcontroller);

export default router;
