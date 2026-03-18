/**
 * Routing related to the authentication API
 * (login, register, logout, access_tokens, refresh_tokens and password reset)
 */

import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { validationHandler } from '../../shared/middlewares/validation.middleware.js';
import { validateLogin, validateRegister } from '../../shared/validators/index.js'


export const createAuthRouter = ({ UserModel, TokenModel }) => {

    const authRouter = Router();
    const authService = new AuthService({ UserModel, TokenModel });
    const authController = new AuthController({ authService });

    authRouter.post('/login', validationHandler(validateLogin), authController.login)
    authRouter.post('/register', validationHandler(validateRegister), authController.register)

    return authRouter;
}