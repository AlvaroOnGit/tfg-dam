export class GameController {

    constructor({ gameService } = {}) {
        this.gameService = gameService;
    }

    getAllGames = async (req, res, next) => {
        try {
            const { page, limit, ...filters} = req.validatedQuery;
            const { total, games } = await this.gameService.getAllGames({ ...filters, page, limit });
            res.status(200).json({ page, total, limit, games });
        } catch (e) {
            next(e);
        }
    }


    getGameBySlug = async (req, res, next) => {
        const { slug } = req.params;
        try {
            const game = await this.gameService.getGameBySlug(slug);
            res.status(200).json(game);
        } catch (e) {
            next(e);
        }
    }
}
