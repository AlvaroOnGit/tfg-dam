/**
 * Contains logic to validate builds for different games
 */

import { ZodError } from 'zod';
import { TaintedGrailBuildSchema, TaintedGrailBuildPartialSchema } from '../schemas/games/tainted_grail/build.schemas.js';
import { EldenRingBuildSchema, EldenRingBuildPartialSchema } from '../schemas/games/elden_ring/build.schemas.js';
import { buildQuerySchema, buildParamsSchema } from '../schemas/builds.schemas.js'

const gameBuildSchemas = {
    "tainted-grail": TaintedGrailBuildSchema,
    "elden-ring": EldenRingBuildSchema,
}

const gameBuildPartialSchemas = {
    "tainted-grail": TaintedGrailBuildPartialSchema,
    "elden-ring": EldenRingBuildPartialSchema,
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
            error: new ZodError([
                {
                    code: "custom",
                    message: `Unsupported game: ${gameSlug}`,
                    path: ['gameSlug']
                }
            ])
        };
    }

    return gameSchema.safeParse(data);
}

/**
 * Validates a game build using the schema associated with the game's slug.
 * All fields are optional, meant to be used in update endpoints for builds.
 *
 * @function validateBuild
 * @param {Object} data - Game build data to validate.
 * @returns {import("zod").SafeParseReturnType<any, any> | { success: false, error: string }}
 * Returns an error object if the game is unsupported, otherwise the result of the schema validation.
 */
export function validateBuildPartial(data) {
    const { gameSlug } = data;

    const gameSchema = gameBuildPartialSchemas[gameSlug];

    if (!gameSchema) {
        return {
            success: false,
            error: new ZodError([
                {
                    code: "custom",
                    message: `Unsupported game: ${gameSlug}`,
                    path: ['gameSlug']
                }
            ])
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
    return buildQuerySchema.safeParse(data);
}

/**
 * Validates params for routes with
 * Checks that the id is a valid UUID
 * Checks that the userId is a valid UUID
 *
 * @param {Object} data - Route params to validate
 * @returns {import("zod").SafeParseReturnType<any, any>}
 */
export function validateBuildParams(data) {
    return buildParamsSchema.partial().safeParse(data);
}