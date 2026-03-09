/**
 * Contains logic to validate assets for different games
 */

import EldenRingSchema from '../schemas/games/elden_ring/asset.schemas.js'
import TaintedGrailSchema from '../schemas/games/tainted_grail/asset.schemas.js';

const gameSchemas = {
    "elden-ring": EldenRingSchema,
    "tainted-grail": TaintedGrailSchema
}

/**
 * Validates a game asset using the schema associated with the game's slug.
 *
 * @async
 * @function validateAsset
 * @param {Object} data - Game asset data to validate.
 * @returns {Promise<
 *   | { success: false, error: string }
 *   | import("zod").SafeParseReturnType<any, any>
 * >}
 * Returns an error if the game is unsupported, otherwise the result of the schema validation.
 */
export async function validateAsset(data) {

    const { gameSlug } = data

    const gameSchema = gameSchemas[gameSlug];

    if (!gameSchema) {
        return {
            success: false,
            error: `Unsupported game: ${gameSlug}`
        };
    }

    return await gameSchema.safeParse(data);
}
