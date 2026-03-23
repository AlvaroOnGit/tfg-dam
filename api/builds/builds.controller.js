export class BuildController {
    constructor({buildService} = {}) {
        this.buildService = buildService;
    }

    getAll = async (req, res, next) => {
        try {
            const filters = req.validated?.query ?? req.query;
            const build = await this.buildService.getAll(filters);
            res.status(200).json(build);
        } catch (e) {
            next(e);
        }
    }

    getById = async (req, res, next) => {
        try {
            const { id } = req.validated?.params ?? req.params;
            const build = await this.buildService.getById(id);
            res.status(200).json(build);
        } catch (e) {
            next(e);
        }
    }

    create = async (req, res, next) => {
        try {
            const build = await this.buildService.createBuild(req.body, req.user.id);
            res.status(201).json(build);
        } catch (e) {
            next(e);
        }
    }

    update = async (req, res, next) => {
        try {
            const { id } = req.validated?.params ?? req.params;
            const build = await this.buildService.updateBuild(id, req.body, req.user.id);
            res.status(200).json(build);
        } catch (e) {
            next(e);
        }
    }

    remove = async (req, res, next) => {
        try {
            const { id } = req.validated?.params ?? req.params;
            await this.buildService.deleteBuild(id, req.user.id);
            res.status(204).json({ message: 'Build deleted successfully' });
        } catch (e) {
            next(e);
        }
    }

}