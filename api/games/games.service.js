import { GameModel } from '../../shared/models/game.model.js';

export class GameService {
    constructor({} = {}) {

    }

    async getGames(params) {
        return await GameModel.getGames(params);
    }

    async getGameBySlug(slug) {
        return await GameModel.getGameBySlug(slug);
    }
}
