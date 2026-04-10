export class GameController {
    constructor({ gameService } = {}) {
        this.gameService = gameService;
    }

    // List games with pagination and optional filters
    list = async (req, res, next) => {
        try {
            const page = req.query.page ? parseInt(req.query.page, 10) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : 15;
            const name = req.query.name;
            // genre can be a single string or an array
            let genre = req.query.genre;
            if (genre && !Array.isArray(genre)) {
                genre = [genre];
            }
            const data = await this.gameService.getGames({ page, limit, name, genre });
            res.status(200).json(data);
        } catch (e) {
            next(e);
        }
    }

    // Get a single game by slug
    getBySlug = async (req, res, next) => {
        try {
            const slug = req.params.slug;
            const game = await this.gameService.getGameBySlug(slug);
            if (!game) {
                res.status(404).json({ message: 'Game not found' });
                return;
            }
            res.status(200).json(game);
        } catch (e) {
            next(e);
        }
    }
}
