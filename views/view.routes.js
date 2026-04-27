/**
 * Handles routing for rendering views
 */
import { Router } from 'express';
import { ViewController } from './view.controller.js';

export const createViewRouter = () => {

    const viewRouter = Router();
    const viewController = new ViewController();
    const requireSessionForView = (req, res, next) => {
        if (!req.cookies?.access_token) {
            return res.redirect('/auth');
        }
        next();
    };

    viewRouter.get('/', viewController.index);
    viewRouter.get('/user/settings', requireSessionForView, viewController.userAccount);

    return viewRouter;
}