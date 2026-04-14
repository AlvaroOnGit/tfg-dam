/**
 * Rate limiting middleware
 * Prevents brute force attacks by restricting the number of requests
 * a client can make to the server within a given time window
 */
import rateLimit from 'express-rate-limit';

/**
 * @param {number} max - Maximum number of requests allowed within the time window
 * @param {number} minutes - Duration of the time window in minutes
 * @returns Express rate limit middleware
 */
export const limitHandler = (max, minutes) => rateLimit({
    max,
    windowMs: minutes * 60 * 1000,
    message: { error: 'Too many attempts, please try again later' },
});