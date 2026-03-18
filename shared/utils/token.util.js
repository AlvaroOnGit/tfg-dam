/**
 * Shared utility to sign and verify JWT tokens
 */
import jwt from 'jsonwebtoken';
import { AuthenticationError } from '../middlewares/error.middleware.js';

export class TokenUtil {
    /**
     * Generates a short-lived access token
     * @param {Object} user - User data
     * @returns {string} Signed JWT access token
     */
    static generateAccessToken(user) {
        const payload = {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            roleLevel: user.roleLevel,
            isVerified: user.isVerified,
            type: 'access'
        }

        return jwt.sign(
            payload,
            process.env.JWT_ACCESS_SECRET_KEY,
            { expiresIn: process.env.JWT_ACCESS_EXPIRES }
        );
    }
    /**
     * Generates a long-lived refresh token
     * @param {Object} user - User data (only id needed)
     * @returns {Object} { token: string, expiration: Date }
     */
    static generateRefreshToken(user) {
        const payload = {
            id: user.id,
            type: 'refresh'
        }
        const token = jwt.sign(
            payload,
            process.env.JWT_REFRESH_SECRET_KEY,
            { expiresIn: process.env.JWT_REFRESH_EXPIRES }
        )
        const expiration = new Date
        (Date.now() + process.env.JWT_REFRESH_TOKEN_LIFETIME * 24 * 60 * 60 *1000);
        return { token, expiration }
    }
    /**
     * Verifies an access token
     * @param {string} token - JWT token to verify
     * @returns {Object} Decoded payload
     * @throws {AuthenticationError} If invalid or expired
     */
    static verifyAccessToken(token) {
        let payload;
        try {
            payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET_KEY);
        } catch (e) {
            if (e.name === 'TokenExpiredError') {
                throw new AuthenticationError('Token expired');
            }
            throw new AuthenticationError('Invalid token');
        }
        return payload;
    }
    /**
     * Verifies a refresh token
     * @param {string} token - JWT token to verify
     * @returns {Object} Decoded payload
     * @throws {AuthenticationError} If invalid or expired
     */
    static verifyRefreshToken(token) {
        let payload;
        try {
            payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET_KEY);
        } catch (e) {
            if (e.name === 'TokenExpiredError') {
                throw new AuthenticationError('Token expired');
            }
            throw new AuthenticationError('Invalid token');
        }
        return payload;
    }
}