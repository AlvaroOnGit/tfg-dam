/**
 * Contains logic to validate builds for different games
 */

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