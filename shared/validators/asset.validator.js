/**
 * Contains logic to validate assets for different games
 */

import { z } from 'zod';
import EldenRingAssetSchema from '../schemas/games/elden_ring/asset.schemas.js'
import TaintedGrailAssetSchema from '../schemas/games/tainted_grail/asset.schemas.js';

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

// ─── Query & Params Validation ───────────────────────────────────────────────

const assetQuerySchema = z.object({
    gameSlug: z
        .string('gameSlug is required')
        .trim()
        .min(1, 'gameSlug cannot be empty')
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'gameSlug must be lowercase alphanumeric with hyphens'),
    name: z
        .string()
        .trim()
        .min(1, 'name cannot be empty')
        .optional(),
    type: z
        .string()
        .trim()
        .min(1, 'type cannot be empty')
        .optional(),
    category: z
        .string()
        .trim()
        .min(1, 'category cannot be empty')
        .optional(),
    tags: z.union([
        z.array(z.string().trim().min(1)),
        z.string().trim().min(1).transform(v => [v])
    ]).optional(),
    page: z.coerce
        .number()
        .int('page must be an integer')
        .min(1, 'page must be at least 1')
        .default(1),
    limit: z.coerce
        .number()
        .int('limit must be an integer')
        .min(1, 'limit must be at least 1')
        .max(50, 'limit cannot exceed 50')
        .default(15),
});

const assetIdSchema = z.object({
    id: z.string().uuid('id must be a valid UUID'),
});

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
