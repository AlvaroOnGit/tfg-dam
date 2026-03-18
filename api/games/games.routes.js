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

    return gameRouter;
}