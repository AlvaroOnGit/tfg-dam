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
        res.locals.alert = {
            type: 'warning',
            message: 'This is an alert...'
        };
        next();
    });

    viewRouter.get('/', viewController.index);
    viewRouter.get('/auth', authHandler, viewController.auth);

    return viewRouter;
}