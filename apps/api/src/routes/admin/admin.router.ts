import createRouter from '#lib/create-router.js';

import dashboard from './dashboard/controller.js';

const router = createRouter()
    .route('/dashboard', dashboard);

export default router;
