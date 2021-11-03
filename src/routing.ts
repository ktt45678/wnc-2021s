import { Router } from 'express';

import { errorHandler, nullRoute } from './middlewares/errors.middleware';
import index from './routes/index/index.controller';
import auth from './routes/auth/auth.controller';
import categories from './routes/categories/categories.controller';
import users from './routes/users/users.controller';
import products from './routes/products/products.controller';
import ratings from './routes/ratings/ratings.controller';

const router: Router = Router();

// Set up routes
router.use('/', index);
router.use('/auth', auth);
router.use('/users', users);
router.use('/categories', categories);
router.use('/products', products);
router.use('/ratings', ratings);

// Error-handling middleware
router.use(errorHandler);
router.use(nullRoute);

export default router;