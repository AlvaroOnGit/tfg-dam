import { AuthenticationError } from "./error.middleware.js";
import { TokenUtil } from "../utils/token.util.js";

export const authHandler = async (req, res, next) => {

    // noinspection JSUnresolvedReference
    const token = req.cookies.access_token;
    if (!token) {
        const e = new AuthenticationError('Access token not found');
        return next(e);
    }
    try {
        req.user = TokenUtil.verifyAccessToken(token);
        next();
    } catch (e) {
        next(e);
    }
}