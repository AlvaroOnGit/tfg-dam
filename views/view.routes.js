/**
 * Handles routing for rendering views
 */
import { Router } from 'express';
import { ViewController } from './view.controller.js';
import { authHandler } from '../shared/middlewares/auth.middleware.js';

export const createViewRouter = () => {

    const viewRouter = Router();
    const viewController = new ViewController();
    

    viewRouter.get('/', viewController.index);
    viewRouter.get('/user/settings', authHandler, viewController.userAccount);

    return viewRouter;
}