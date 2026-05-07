/**
 * Routing related to the user API
 *
 */
import { Router } from 'express';
import { UserController } from './users.controller.js';
import { UserService } from './users.service.js';
import { authHandler } from '../../shared/middlewares/auth.middleware.js';
import { validationHandler } from '../../shared/middlewares/validation.middleware.js';
import { validateUserParams, validateUserUpdate } from "../../shared/validators/index.js";
import { limitHandler } from '../../shared/middlewares/limiter.middleware.js';

export const createUserRouter = ({ UserModel }) => {

    const userRouter = Router();
    const userService = new UserService({ UserModel });
    const userController = new UserController({ userService });

    userRouter.get('/me', authHandler, userController.getMyProfile);
    userRouter.patch('/me/email',
        limitHandler(10, 15),
        authHandler,
        validationHandler(validateUserUpdate),
        userController.updateEmail
    );
    userRouter.patch(`/me/password`,
        limitHandler(10, 15),
        authHandler,
        validationHandler(validateUserUpdate),
        userController.updatePassword
    );
    userRouter.patch(`/me/username`,
        limitHandler(10, 15),
        authHandler,
        validationHandler(validateUserUpdate),
        userController.updateUsername
    );
    userRouter.get('/:id', validationHandler(validateUserParams, 'params'), userController.getPublicProfile);

    return userRouter;
}