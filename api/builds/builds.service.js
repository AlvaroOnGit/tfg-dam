import {InternalError, NotFoundError} from "../../shared/middlewares/error.middleware.js";

export class BuildService {
    constructor({ BuildModel } = {}) {
        this.buildModel = BuildModel;
    }

    getAll = async () => {
        try {
            return await this.buildModel.findAll();
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

    createBuild = async (buildData) => {
        try {
            return await this.buildModel.create(buildData);
        } catch (e) {
            throw new InternalError('Failed to create build', e);
        }
    }

    updateBuild = async (id, buildData) => {
        let existing;
        try {
            existing = await this.buildModel.findById(id);
        } catch (e) {
            throw new InternalError('Failed to fetch build', e);
        }
        if (!existing) {
            throw new NotFoundError('Build not found');
        }
        try {
            return await this.buildModel.update(id, buildData);
        } catch (e) {
            throw new InternalError('Failed to update build', e);
        }
    }

    deleteBuild = async (id) => {
        let existing;
        try {
            existing = await this.buildModel.findById(id);
        } catch (e) {
            throw new InternalError('Failed to fetch build', e);
        }
        if (!existing) {
            throw new NotFoundError('Build not found');
        }
        try {
            await this.buildModel.delete(id);
        } catch (e) {
            throw new InternalError('Failed to delete build', e);
        }
    }
}