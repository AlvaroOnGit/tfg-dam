import { InternalError, NotFoundError } from '../../shared/middlewares/error.middleware.js';

export class AssetService {
    constructor({ AssetModel } = {}) {
        this.assetModel = AssetModel;
    }

    getAll = async (query) => {
        let result;
        try {
            result = await this.assetModel.findAll(query);
        } catch (e) {
            throw new InternalError('Failed to fetch assets', e);
        }
        return result;
    }

    getById = async (id) => {
        let asset;
        try {
            asset = await this.assetModel.findById(id);
        } catch (e) {
            throw new InternalError('Failed to fetch asset', e);
        }
        if (!asset) {
            throw new NotFoundError('Asset not found');
        }
        return asset;
    }
}