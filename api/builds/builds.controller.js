import { AuthenticationError } from '../../shared/middlewares/error.middleware.js';

export class BuildController {
    constructor({ buildService } = {}) {
        this.buildService = buildService;
    }

    allowedRoles = ['creator', 'co-owner'];

    getAllBuilds = async (req, res, next) => {
        try {
            const { page, limit, ...filters} = req.validatedQuery;
            const { total, builds } = await this.buildService.getAllBuilds({ ...filters, page, limit });
            res.status(200).json({ page, total, limit, builds });
        } catch (e) {
            next(e);
        }
    }

    getBuildById = async (req, res, next) => {
        try {
            const { id } = req.params;
            req.build = await this.buildService.getBuildById(id);
            next();
        } catch (e) {
            next(e);
        }
    }

    createBuild = async (req, res, next) => {
        if (!req.user) {
            return next(new AuthenticationError('Access token not found'));
        }

        try {
            req.build = await this.buildService.createBuild(req.body, req.user.id);
            next()
        } catch (e) {
            next(e);
        }
    }

    updateBuild = async (req, res, next) => {
        if (!req.user) {
            return next(new AuthenticationError('Access token not found'));
        }

        try {
            const { id } = req.params;
            req.build = await this.buildService.updateBuild(id, req.body);
            next();
        } catch (e) {
            next(e);
        }
    }

    deleteBuild = async (req, res, next) => {
        if (!req.user) {
            return next(new AuthenticationError('Access token not found'));
        }

        const { role } = req.permission;
        if (!this.allowedRoles.includes(role)) {
            return res.status(403).json({ message: 'Insufficient permissions' });
        }
        try {
            const { id } = req.params;
            await this.buildService.deleteBuild(id);
            res.status(204).send();
        } catch (e) {
            next(e);
        }
    }

    getEditPermission = async (req, res, next) => {
        const { id } = req.params;
        try {
            const permission = await this.buildService.getEditPermission(id);
            res.status(200).json(permission)
        } catch (e) {
            next(e);
        }
    }

    grantEditPermission = async (req, res, next) => {
        if (!req.user) {
            return next(new AuthenticationError('Access token not found'));
        }

        const { role } = req.permission;
        if (!this.allowedRoles.includes(role)) {
            return res.status(403).json({ message: 'Insufficient permissions' });
        }
        const { userId, userRole } = req.body;
        const { id } = req.params;
        try {
            await this.buildService.grantEditPermission(id, userId, userRole);
            res.status(201).json({ message: 'Edit permission granted successfully' });
        } catch (e) {
            next(e);
        }
    }

    revokeEditPermission = async (req, res, next) => {
        if (!req.user) {
            return next(new AuthenticationError('Access token not found'));
        }

        const { role } = req.permission;
        if (!this.allowedRoles.includes(role)) {
            return res.status(403).json({ message: 'Insufficient permissions' });
        }
        const { id, userId } = req.params;
        try {
            await this.buildService.revokeEditPermission(id, userId);
            res.status(204).send();
        } catch (e) {
            next(e);
        }
    }

}