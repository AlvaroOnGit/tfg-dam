/**
 * Routing related to the build API
 */
import { Router } from 'express';
import { BuildController } from './builds.controller.js';
import { BuildService } from './builds.service.js';
import { validateBuild } from '../../shared/validators/index.js';
import { validationHandler } from '../../shared/middlewares/validation.middleware.js';

export const createBuildRouter = ({ BuildModel }) => {

    const buildRouter = Router();
    const buildService = new BuildService({ BuildModel });
    const buildController = new BuildController({ buildService });

    buildRouter.get('/', buildController.getAll);
    buildRouter.get('/:id',
        buildController.getById
    );
    buildRouter.post('/',
        validationHandler(validateBuild),
        buildController.create
    );
    buildRouter.patch('/:id',
        validationHandler(validateBuild),
        buildController.update
    );
    buildRouter.delete('/:id',
        buildController.remove
    );

    return buildRouter;
}