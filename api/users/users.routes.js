/**
 * Routing related to the user API
 *
 */
import { Router } from 'express';
import { UserController } from './users.controller.js';
import { UserService } from './users.service.js';

export const createUserRouter = ({ UserModel }) => {

    const userRouter = Router();
    const userService = new UserService({ UserModel });
    const userController = new UserController({ userService });

    userRouter.get('/me', userController.getMyProfile);
    userRouter.get('/:id', userController.getPublicProfile);

    return userRouter;
}