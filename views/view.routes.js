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
    viewRouter.get('/user/settings', authHandler, viewController.userAccount);
    viewRouter.get('/user/me', authHandler, viewController.userProfile);
    viewRouter.get('/users/:id', authHandler, viewController.otherProfile);

    viewRouter.use(viewController.notFound);

    // Build views
    viewRouter.get('/builds/create', authHandler, viewController.createBuild);

    return viewRouter;
}