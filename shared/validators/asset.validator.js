/**
 * Contains logic to validate assets for different games
 */

import EldenRingAssetSchema from '../schemas/games/elden_ring/asset.schemas.js'
import TaintedGrailAssetSchema from '../schemas/games/tainted_grail/asset.schemas.js';
import { assetQuerySchema, assetIdSchema } from '../schemas/asset.schemas.js';

const gameAssetSchemas = {
    "elden-ring": EldenRingAssetSchema,
    "tainted-grail": TaintedGrailAssetSchema
}

/**
 * Validates a game asset using the schema associated with the game's slug.
 *
 * @function validateAsset
 * @param {Object} data - Game asset data to validate.
 * @returns {import("zod").SafeParseReturnType<any, any> | { success: false, error: string }}
 * Returns an error object if the game is unsupported; otherwise, returns the Zod validation result.
 */
export function validateAsset(data) {
    const { gameSlug } = data;

    const gameAssetSchema = gameAssetSchemas[gameSlug];

    if (!gameAssetSchema) {
        return {
            success: false,
            error: `Unsupported game: ${gameSlug}`
        };
    }

    return gameAssetSchema.safeParse(data);
}

/**
 * Validates query parameters for the GET /assets endpoint.
 *
 * @function validateAssetQuery
 * @param {Object} data - Query parameters to validate.
 * @returns {import("zod").SafeParseReturnType<any, any>}
 */
export function validateAssetQuery(data) {
    return assetQuerySchema.safeParse(data);
}

/**
 * Validates path parameters for the GET /assets/:id endpoint.
 *
 * @function validateAssetId
 * @param {Object} data - Path parameters to validate.
 * @returns {import("zod").SafeParseReturnType<any, any>}
 */
export function validateAssetId(data) {
    return assetIdSchema.safeParse(data);
}