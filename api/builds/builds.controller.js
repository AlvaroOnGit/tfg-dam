export class BuildController {
    constructor({buildService} = {}) {
        this.buildsService = buildService;
    }

    getAll = async (req, res, next) => {
        try {
            const builds = await this.buildsService.getAll();
            res.status(200).json(builds);
        } catch (e) {
            next(e);
        }
    }

    getById = async (req, res, next) => {
        try {
            const {id} = req.params;
            const build = await this.buildsService.getById(id);
            res.status(200).json(build);
        } catch (e) {
            next(e);
        }
    }

    create = async (req, res, next) => {
        try {
            const build = await this.buildsService.createBuild(req.body);
            res.status(201).json(build);
        } catch (e) {
            next(e);
        }
    }

    update = async (req, res, next) => {
        try {
            const {id} = req.params;
            const build = await this.buildsService.updateBuild(id, req.body);
            res.status(200).json(build);
        } catch (e) {
            next(e);
        }
    }

    remove = async (req, res, next) => {
        try {
            const {id} = req.params;
            await this.buildsService.deleteBuild(id);
            res.status(204).send();
        } catch (e) {
            next(e);
        }
    }

}