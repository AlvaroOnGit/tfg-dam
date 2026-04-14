import { InternalError, NotFoundError } from '../../shared/middlewares/error.middleware.js';

export class AssetService {
    constructor({ AssetModel } = {}) {
        this.assetModel = AssetModel;
    }

    getAllAssets = async (query) => {
        try {
            return await this.assetModel.findAllAssets(query);
        } catch (e) {
            throw new InternalError('Failed to fetch assets', e);
        }
    }

    getAssetById = async (id) => {
        let asset;
        try {
            asset = await this.assetModel.findAssetById(id);
        } catch (e) {
            throw new InternalError('Failed to fetch asset', e);
        }
        if (!asset) {
            throw new NotFoundError('Asset not found');
        }
        return asset;
    }
}