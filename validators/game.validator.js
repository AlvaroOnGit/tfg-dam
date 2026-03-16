/**
 * Contains logic to validate games
 */

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