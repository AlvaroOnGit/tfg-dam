/**
 * Routing related to the build API
 */
import { Router } from 'express';
import { BuildController } from './builds.controller.js';
import { BuildService } from './builds.service.js';
import { validationHandler } from '../../shared/middlewares/validation.middleware.js';
import { authHandler } from '../../shared/middlewares/auth.middleware.js';
import { validateBuild, validateBuildQuery, validateBuildId } from '../../shared/validators/index.js';
import {validateBuildUpdate} from "../../shared/validators/build.validator.js";

export const createBuildRouter = ({ BuildModel }) => {

    const buildRouter = Router();
    const buildService = new BuildService({ BuildModel });
    const buildController = new BuildController({ buildService });

    buildRouter.get('/',
        validationHandler(validateBuildQuery, 'query'),
        buildController.getAll
    );

    buildRouter.get('/:id',
        validationHandler(validateBuildId, 'params'),
        buildController.getById
    );

    buildRouter.post('/',
        authHandler,
        validationHandler(validateBuild),
        buildController.create
    );

    buildRouter.patch('/:id',
        authHandler,
        validationHandler(validateBuildId, 'params'),
        validationHandler(validateBuildUpdate),
        buildController.update
    );

    buildRouter.delete('/:id',
        authHandler,
        validationHandler(validateBuildId, 'params'),
        buildController.remove
    );

    return buildRouter;
}