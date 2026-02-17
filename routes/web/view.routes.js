/**
 * Handles routing for rendering views
 */
import { Router } from 'express';
import { ViewController } from '../../controllers/web/view.controller.js';

export const createViewRouter = () => {

    const viewRouter = Router();
    const viewController = new ViewController();

    viewRouter.get('/', viewController.index);

    return viewRouter;
}