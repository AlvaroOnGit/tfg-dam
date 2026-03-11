/**
 * Contains logic to validate builds for different games
 */

import TaintedGrailBuildSchema from '../schemas/games/tainted_grail/buidls.schemas.js';
import EldenRingBuildSchema from "../schemas/games/elden_ring/buidls.schemas.js";

const gameBuildSchemas = {
    "tainted-grail": TaintedGrailBuildSchema,
    "elden-ring": EldenRingBuildSchema,
}

export async function validateBuild(data) {

    const { gameSlug } = data;

    const gameSchema = gameBuildSchemas[gameSlug];

    if (!gameSchema) {
        return {
            success: false,
            error: `Unsupported game: ${gameSlug}`
        };
    }

    return await gameSchema.safeParse(data);
}