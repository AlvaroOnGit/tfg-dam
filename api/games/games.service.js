import { InternalError, NotFoundError } from "../../shared/middlewares/error.middleware.js";


export class GameService {

    constructor({ GameModel } = {}) {
        this.gameModel = GameModel;
    }

    async getAllGames(filters) {
        try {
            return await this.gameModel.findAllGames(filters);
        } catch (e) {
            throw new InternalError('Failed to fetch games', e);
        }
    }

    async getGameBySlug(slug) {
        let game;
        try {
            game = await this.gameModel.findGameBySlug(slug);
        } catch (e) {
            throw new InternalError('Failed to fetch game', e);
        }
        if (!game) {
            throw new NotFoundError('Game not found');
        }
        return game;
    }
}
