/**
 * Routing related to the asset API
 */

import { Router } from 'express';
import { AssetController } from './assets.controller.js';
import { AssetService } from './assets.service.js';
import { validateAssetQuery, validateAssetId } from '../../shared/validators/index.js';
import { validationHandler } from '../../shared/middlewares/validation.middleware.js';


export const createAssetRouter = ({ AssetModel }) => {

    const assetRouter = Router();
    const assetService = new AssetService({ AssetModel });
    const assetController = new AssetController({ assetService });

    assetRouter.get('/', validationHandler(validateAssetQuery, 'query'), assetController.getAllAssets);
    assetRouter.get('/:id', validationHandler(validateAssetId, 'params'), assetController.getAssetById);

    return assetRouter;
}