/**
 * Routing related to the asset API
 */

import { Router } from 'express';
import { AssetController } from './assets.controller.js';
import { AssetService } from './assets.service.js';


export const createAssetRouter = ({}) => {

    const assetRouter = Router();
    const assetService = new AssetService({});
    const assetController = new AssetController({ assetService });

    return assetRouter;
}