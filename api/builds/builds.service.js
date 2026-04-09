import {ForbiddenError, InternalError, NotFoundError} from "../../shared/middlewares/error.middleware.js";

export class BuildService {

    constructor({ BuildModel } = {}) {
        this.buildModel = BuildModel;
    }

    getAll = async (filters) => {
        try {
            return await this.buildModel.findAll(filters);
        } catch (e) {
            throw new InternalError('Failed to fetch builds', e);
        }
    }

    getById = async (id) => {
        let build;
        try {
            build = await this.buildModel.findById(id);
        } catch (e) {
            throw new InternalError('Failed to fetch build', e);
        }
        if (!build) {
            throw new NotFoundError('Build not found');
        }
        return build;
    }

    createBuild = async (buildData, userId) => {
        const build = { ...buildData, creatorId: userId };

        try {
            return await this.buildModel.create(build);
        } catch (e) {
            throw new InternalError('Failed to create build', e);
        }
    }

    updateBuild = async (id, buildData, userId) => {
        let existing;
        try {
            existing = await this.buildModel.findById(id);
        } catch (e) {
            throw new InternalError('Failed to fetch build', e);
        }
        if (!existing) {
            throw new NotFoundError('Build not found');
        }

        let hasPermission;
        try {
            hasPermission = await this.buildModel.hasEditPermission(id, userId);
        } catch (e) {
            throw new InternalError('Failed to check permissions', e);
        }
        if (!hasPermission) {
            throw new ForbiddenError('You do not have permission to edit this build');
        }

        try {
            return await this.buildModel.update(id, buildData);
        } catch (e) {
            throw new InternalError('Failed to update build', e);
        }
    }

    deleteBuild = async (id, userId) => {
        let existing;
        try {
            existing = await this.buildModel.findById(id);
        } catch (e) {
            throw new InternalError('Failed to fetch build', e);
        }
        if (!existing) {
            throw new NotFoundError('Build not found');
        }

        let hasPermission;
        try {
            hasPermission = await this.buildModel.hasEditPermission(id, userId);
        } catch (e) {
            throw new InternalError('Failed to check permissions', e);
        }
        if (!hasPermission) {
            throw new ForbiddenError('You do not have permission to delete this build');
        }

        try {
            await this.buildModel.delete(id);
        } catch (e) {
            throw new InternalError('Failed to delete build', e);
        }
    }
}