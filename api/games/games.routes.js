/**
 * Routing related to the games API
 *
 */
import { Router } from "express";
import { GameController } from './games.controller.js';
import { GameService } from './games.service.js';

export const createGameRouter = ({}) => {

    const gameRouter = Router();
    const gameService = new GameService({});
    const gameController = new GameController({ gameService });

    // List games with optional filters
    gameRouter.get('/', gameController.list);
    // Get a single game by slug
    gameRouter.get('/:slug', gameController.getBySlug);

    return gameRouter;
}
