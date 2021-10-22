import { Router } from 'express';

import { errorHandler, nullRoute } from './middlewares/errors.middleware';
import index from './routes/index/index.controller';
import auth from './routes/auth/auth.controller';
import categories from './routes/categories/categories.controller';
import users from './routes/users/users.controller';

const router: Router = Router();

// Set up routes
router.use('/', index);
router.use('/auth', auth);
router.use('/users', users);
router.use('/categories', categories);

// Error-handling middleware
router.use(errorHandler);
router.use(nullRoute);

export default router;