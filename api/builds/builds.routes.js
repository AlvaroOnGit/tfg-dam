/**
 * Routing related to the build API
 *
 */
import { Router } from "express";
import { BuildController } from './builds.controller.js';
import { BuildService } from './builds.service.js';

export const createBuildRouter = ({}) => {

    const buildRouter = Router();
    const buildService = new BuildService({});
    const buildController = new BuildController({ buildService });

    return buildRouter;
}