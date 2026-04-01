/**
 * Routing related to the user API
 *
 */
import { Router } from 'express';
import { UserController } from './users.controller.js';
import { UserService } from './users.service.js';

export const createUserRouter = ({}) => {

    const userRouter = Router();
    const userService = new UserService({});
    const userController = new UserController({ userService });

    return userRouter;
}