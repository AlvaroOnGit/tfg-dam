export class AssetController {
    constructor({ assetService } = {}) {
        this.assetService = assetService;
    }

    getAssets = async (req, res, next) => {
        try {
            const { page, limit, ...filters } = req.validatedQuery;
            const { total, assets } = await this.assetService.getAll({ ...filters, page, limit });
            res.status(200).json({ page, total, limit, assets });
        } catch (e) {
            next(e);
        }
    }

    getAssetById = async (req, res, next) => {
        try {
            const { id } = req.params;
            const asset = await this.assetService.getById(id);
            res.status(200).json(asset);
        } catch (e) {
            next(e);
        }
    }
}
