import { InternalError, ForbiddenError, NotFoundError } from "./error.middleware.js";

/**
 * Middleware hat checks if the authenticated user has access to a specific build.
 *
 * Retrieves all permissions for a build and verifies
 * whether `req.user.id` exists in the permission list.
 *
 * If the user has permission, their permission object is attached to
 * `req.permission`.
 *
 * @function permissionHandler
 * @param {Object} buildModel - Model containing build-related database methods.
 * @param {Function} buildModel.getBuildPermissions - Function that retrieves
 *        an array of permission objects for a given build.
 *
 * @returns {import('express').RequestHandler} Express middleware function.
 *
 * @throws {InternalError} When permission retrieval from database fails.
 * @throws {ForbiddenError} When the user does not have permission to access the build.
 */
export const permissionHandler = (buildModel) => async (req, res, next) => {
    let permissions;
    try {
        permissions = await buildModel.getBuildPermissions(req.params.id);
    } catch (e) {
        throw new InternalError('Failed to check permissions', e);
    }
    if (permissions.length === 0) {
        throw new NotFoundError('Build not found');
    }
    const userPermission = permissions.find(
        (user) => user.id === req.user.id
    );
    if (!userPermission) {
        throw new ForbiddenError('Insufficient permissions');
    }
    req.permission = userPermission;
    next();
};