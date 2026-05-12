/**
 * Contains logic to validate games
 */

import { gameParamsSchema, gameQuerySchema } from '../schemas/game.schemas.js';
import gameSchema  from '../schemas/game.schemas.js';

/**
 * Validates a game using the game schema.
 *
 * @function validateGame
 * @param {Object} data - Game data to validate.
 * @returns {import("zod").SafeParseReturnType<any, any> | { success: false, error: string }}
 * returns the Zod validation result.
 */
export function validateGame(data) {
    return gameSchema.safeParse(data);
}

/**
 * Validates the query parameters for GET /games
 * Supports: name, genres, page, limit
 *
 * @param {Object} data - Query parameters to validate
 * @returns {import("zod").SafeParseReturnType<any, any>}
 */
export function validateGameQuery(data) {
    return gameQuerySchema.safeParse(data);
}

/**
 * Validates params for game routes
 * Checks that the slug is a valid slug
 *
 * @param {Object} data - Route params to validate
 * @returns {import("zod").SafeParseReturnType<any, any>}
 */
export function validateGameParams(data) {
    return gameParamsSchema.safeParse(data);
}
