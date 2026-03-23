/**
 * Contains logic to validate builds for different games
 */

import { z } from 'zod';
import TaintedGrailBuildSchema from '../schemas/games/tainted_grail/build.schemas.js';
import EldenRingBuildSchema from "../schemas/games/elden_ring/build.schemas.js";

const gameBuildSchemas = {
    "tainted-grail": TaintedGrailBuildSchema,
    "elden-ring": EldenRingBuildSchema,
}

/**
 * Validates a game build using the schema associated with the game's slug.
 *
 * @function validateBuild
 * @param {Object} data - Game build data to validate.
 * @returns {import("zod").SafeParseReturnType<any, any> | { success: false, error: string }}
 * Returns an error object if the game is unsupported, otherwise the result of the schema validation.
 */
export function validateBuild(data) {

    const { gameSlug } = data;

    const gameSchema = gameBuildSchemas[gameSlug];

    if (!gameSchema) {
        return {
            success: false,
            error: `Unsupported game: ${gameSlug}`
        };
    }

    return gameSchema.safeParse(data);
}

/**
 * Validates the query parameters for GET /builds
 * Supports: gameSlug, name, tags, creator, page, limit
 *
 * @param {Object} data - Query parameters to validate
 * @returns {import("zod").SafeParseReturnType<any, any>}
 */
export function validateBuildQuery(data) {
    const schema = z.object({
        gameSlug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'gameSlug must be a valid slug').optional(),
        name:     z.string().optional(),
        tags:     z.union([z.string(), z.array(z.string())]).optional(),
        creator:  z.uuid().optional(),
        page:     z.coerce.number().int().min(1).optional().default(1),
        limit:    z.coerce.number().int().min(1).max(100).optional().default(20),
    });
    return schema.safeParse(data);
}

/**
 * Validates the :id param for routes with /:id
 * Checks that the id is a valid UUID
 *
 * @param {Object} data - Route params to validate
 * @returns {import("zod").SafeParseReturnType<any, any>}
 */
export function validateBuildId(data) {
    const schema = z.object({
        id: z.string().uuid(),
    });
    return schema.safeParse(data);
}