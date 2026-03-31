/**
 * Routing related to the authentication API
 * (login, register, logout, access_tokens, refresh_tokens and password reset)
 */

import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { validationHandler } from '../../shared/middlewares/validation.middleware.js';
import { authHandler } from '../../shared/middlewares/auth.middleware.js';
import { validateLogin, validateRegister, validatePartialAuth } from '../../shared/validators/index.js'

export const createAuthRouter = ({ UserModel, TokenModel }) => {

    const authRouter = Router();
    const authService = new AuthService({ UserModel, TokenModel });
    const authController = new AuthController({ authService });

    authRouter.post('/login', validationHandler(validateLogin), authController.login)
    authRouter.post('/register', validationHandler(validateRegister), authController.register)
    authRouter.post('/logout', authHandler, authController.logout)
    authRouter.post('/refresh', authController.refresh)
    authRouter.post('/forgot-password', validationHandler(validatePartialAuth), authController.forgot)

    return authRouter;
}