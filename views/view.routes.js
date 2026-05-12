/**
 * Handles routing for rendering views
 */
import { Router } from 'express';
import { ViewController } from './view.controller.js';
import { authHandler } from '../shared/middlewares/auth.middleware.js';

export const createViewRouter = () => {

    const viewRouter = Router();
    const viewController = new ViewController();
    
    viewRouter.use((req, res, next) => {
        res.locals.alert = null;
        next();
    });

    viewRouter.get('/', authHandler, viewController.home);
    viewRouter.get('/auth', authHandler, viewController.auth);
    viewRouter.get('/auth/reset-password/:token', authHandler, viewController.reset);
    viewRouter.get('/users/me', authHandler, viewController.userMe);
    viewRouter.get('/users/:id', authHandler, viewController.user);
    viewRouter.get('/games/:gameSlug', authHandler, viewController.games)
    viewRouter.get('/games/:gameSlug/builder', authHandler, viewController.builder);
    viewRouter.get('/games/:gameSlug/builds/:id', authHandler, viewController.build);

    viewRouter.use(viewController.notFound);

    return viewRouter;
}