/**
 * Routing related to the authentication API
 * (login, register, logout, access_tokens, refresh_tokens and password reset)
 */

import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { validationHandler } from '../../shared/middlewares/validation.middleware.js';
import { authHandler } from '../../shared/middlewares/auth.middleware.js';
import { limitHandler } from '../../shared/middlewares/limiter.middleware.js';
import { validateLogin, validateRegister, validatePartialAuth } from '../../shared/validators/index.js'

export const createAuthRouter = ({ UserModel, TokenModel }) => {

    const authRouter = Router();
    const authService = new AuthService({ UserModel, TokenModel });
    const authController = new AuthController({ authService });

    authRouter.post('/login', limitHandler(10, 15), validationHandler(validateLogin), authController.login)
    authRouter.post('/register', limitHandler(5, 15), validationHandler(validateRegister), authController.register)
    authRouter.post('/logout', authHandler, authController.logout)
    authRouter.post('/refresh', authController.refresh)
    authRouter.post('/forgot-password', limitHandler(5, 15), validationHandler(validatePartialAuth), authController.forgot)
    authRouter.post('/reset-password/:token', limitHandler(5, 15), validationHandler(validatePartialAuth), authController.reset)

    return authRouter;
}