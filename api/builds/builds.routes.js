/**
 * Routing related to the build API
 */
import { Router } from 'express';
import { BuildController } from './builds.controller.js';
import { BuildService } from './builds.service.js';
import { validationHandler } from '../../shared/middlewares/validation.middleware.js';
import { permissionHandler } from "../../shared/middlewares/permission.middleware.js";
import { authHandler } from '../../shared/middlewares/auth.middleware.js';
import { buildParser } from "../../shared/middlewares/parser.middleware.js";
import {
    validateBuildParams,
    validateBuildQuery,
    validateBuild,
    validateBuildPartial
} from '../../shared/validators/index.js';

export const createBuildRouter = ({ BuildModel, UserModel, AssetModel }) => {

    const buildRouter = Router();
    const buildService = new BuildService({ BuildModel, UserModel });
    const buildController = new BuildController({ buildService });

    buildRouter.get('/',
        validationHandler(validateBuildQuery, 'query'),
        buildController.getAllBuilds);
    buildRouter.get('/:id',
        validationHandler(validateBuildParams, 'params'),
        buildController.getBuildById,
        buildParser(AssetModel)
        );
    buildRouter.post('/',
        authHandler,
        validationHandler(validateBuild),
        buildController.createBuild,
        buildParser(AssetModel)
    );
    buildRouter.patch('/:id',
        authHandler,
        permissionHandler(BuildModel),
        validationHandler(validateBuildParams, 'params'),
        validationHandler(validateBuildPartial),
        buildController.updateBuild,
        buildParser(AssetModel)
        );
    buildRouter.delete('/:id',
        authHandler,
        permissionHandler(BuildModel),
        validationHandler(validateBuildParams, 'params'),
        buildController.deleteBuild);
    buildRouter.get('/:id/editors',
        validationHandler(validateBuildParams, 'params'),
        buildController.getEditPermission);
    buildRouter.post('/:id/editors',
        authHandler,
        permissionHandler(BuildModel),
        validationHandler(validateBuildParams, 'params'),
        buildController.grantEditPermission);
    buildRouter.delete('/:id/editors/:userId',
        authHandler,
        permissionHandler(BuildModel),
        validationHandler(validateBuildParams, 'params'),
        buildController.revokeEditPermission);

    return buildRouter;
}