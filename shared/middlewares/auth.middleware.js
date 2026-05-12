import { TokenUtil } from "../utils/token.util.js";
import { AuthService } from '../../api/auth/auth.service.js';
import { UserModel } from '../models/user.model.js';
import { TokenModel } from '../models/token.model.js';

/**
 * Authentication middleware that validates the access token from cookies.
 *
 * If the access token is valid, it attaches the decoded payload to `req.user`.
 * If the access token is expired, it attempts to refresh both access and refresh
 * tokens using the refresh token (if available), updates cookies, and attaches
 * the new decoded user to `req.user`.
 *
 * If no valid authentication is found, `req.user` is set to `null`.
 *
 * @async
 * @function authHandler
 * @param {import('express').Request} req - Express request object. Expects `cookies.access_token` and optionally `cookies.refresh_token`.
 * @param {import('express').Response} res - Express response object used to set refreshed auth cookies when needed.
 * @param {import('express').NextFunction} next - Express next middleware function.
 * @returns {Promise<void>}
 *
 */
export const authHandler = async (req, res, next) => {

    const authService = new AuthService({
        UserModel,
        TokenModel
    });

    // noinspection JSUnresolvedReference
    const accessToken = req.cookies.access_token;
    const refreshToken = req.cookies.refresh_token;

    if (!accessToken && !refreshToken) {
        req.user = null;
        return next();
    }
    if (accessToken) {
        try {
            req.user = TokenUtil.verifyAccessToken(accessToken);
            return next();
        } catch (e) {
            if (e.name !== 'TokenExpiredError') {
                req.user = null;
                return next();
            }
        }
    }

    if (refreshToken) {
        try {
            const {
                refreshToken: newRefreshToken,
                accessToken: newAccessToken
            } = await authService.refreshTokens(refreshToken);

            res.cookie('access_token', newAccessToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'lax',
                maxAge: 15 * 60 * 1000
            });

            res.cookie('refresh_token', newRefreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: Number(process.env.JWT_REFRESH_TOKEN_LIFETIME) * 24 * 60 * 60 * 1000
            });

            req.user = TokenUtil.verifyAccessToken(newAccessToken);

            return next();
        } catch (e) {
            req.user = null;
            return next();
        }
    }

    req.user = null;
    return next();
}