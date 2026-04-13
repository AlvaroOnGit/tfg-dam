import {
    ConflictError,
    InternalError,
    NotFoundError,

} from "../../shared/middlewares/error.middleware.js";

export class BuildService {

    constructor({ BuildModel, UserModel } = {}) {
        this.buildModel = BuildModel;
        this.userModel = UserModel;
    }

    getAllBuilds = async (filters) => {
        try {
            return await this.buildModel.findAllBuilds(filters);
        } catch (e) {
            throw new InternalError('Failed to fetch builds', e);
        }
    }

    //TODO: Parse template_data according to each game?
    // Do independent api calls to parse the remaining assets on frontend
    getBuildById = async (id) => {
        let build;
        try {
            build = await this.buildModel.findBuildById(id);
        } catch (e) {
            throw new InternalError('Failed to fetch build data', e);
        }
        if (!build) {
            throw new NotFoundError('Build not found');
        }
        return build;
    }

    createBuild = async (data, userId) => {
        const { assets, ...buildData } = data;
        const build = { ...buildData, creatorId: userId };

        try {
            return await this.buildModel.createBuild(build, assets);
        } catch (e) {
            throw new InternalError('Failed to create build', e);
        }
    }

    updateBuild = async (id, data) => {
        const { assets, ...buildData } = data;

        try {
            return await this.buildModel.updateBuild(id, buildData, assets);
        } catch (e) {
            throw new InternalError('Failed to update build', e);
        }
    }

    deleteBuild = async (id) => {
        try {
            await this.buildModel.deleteBuild(id);
        } catch (e) {
            throw new InternalError('Failed to delete build', e);
        }
    }

    getEditPermission = async (id) => {
        let permissions;
        try {
            permissions = await this.buildModel.getBuildPermissions(id);
        } catch (e) {
            throw new InternalError('Failed to check permissions', e);
        }
        if (permissions.length === 0) {
            throw new NotFoundError('Build not found');
        }
        return permissions;
    }

    grantEditPermission = async (id, userId, role) => {
        let user;
        try {
            user = await this.userModel.findById(userId);
        } catch (e) {
            throw new InternalError('Could not fetch user');
        }
        if (!user) {
            throw new NotFoundError('User not found');
        }

        try {
            return await this.buildModel.grantEditPermission(id, userId, role);
        } catch (e) {
            if (e.code === 'P0001') throw new ConflictError(e.message);
            if (e.code === '23505') throw new ConflictError('User already has permissions for this build');
            throw new InternalError('Failed to add build permissions', e);
        }
    }

    revokeEditPermission = async (id, userId) => {
        let deleted;
        try {
            deleted = await this.buildModel.revokeEditPermission(id, userId);
        } catch (e) {
            throw new InternalError('Failed to revoke build permissions', e);
        }
        if (!deleted) {
            throw new NotFoundError('Editor not found');
        }
        return deleted;
    }
}