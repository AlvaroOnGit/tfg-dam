import { AuthenticationError } from "./error.middleware.js";
import { TokenUtil } from "../utils/token.util.js";

/**
 * Authentication middleware that validates the access token from cookies.
 *
 * Attaches the decoded user payload to `req.user`.
 *
 *
 * @async
 * @function authHandler
 * @param {import('express').Request} req - Express request object. Expects `cookies.access_token`.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 * @returns {Promise<void>}
 *
 * @throws {AuthenticationError} When access token is not found or invalid.
 */
export const authHandler = async (req, res, next) => {

    // noinspection JSUnresolvedReference
    const token = req.cookies.access_token;
    if (!token) {
        req.user = null;
        return next();
    }
    try {
        req.user = TokenUtil.verifyAccessToken(token);
        return next();
    } catch (e) {
        next(e);
    }
}