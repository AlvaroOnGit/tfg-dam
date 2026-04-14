/**
 * Routing related to the games API
 *
 */
import { Router } from "express";
import { GameController } from './games.controller.js';
import { GameService } from './games.service.js';
import { validationHandler } from '../../shared/middlewares/validation.middleware.js';
import { validateGameQuery, validateGameParams } from '../../shared/validators/index.js';

export const createGameRouter = ({ GameModel }) => {

    const gameRouter = Router();
    const gameService = new GameService({ GameModel });
    const gameController = new GameController({ gameService });

    gameRouter.get('/',
        validationHandler(validateGameQuery, 'query'),
        gameController.getAllGames);
    gameRouter.get('/:slug',
        validationHandler(validateGameParams, 'params'),
        gameController.getGameBySlug);

    return gameRouter;
}
