/**
 * Contains logic to validate assets for different games
 */

import EldenRingSchema from '../schemas/games/elden_ring/asset.schemas.js'
import TaintedGrailSchema from '../schemas/games/tainted_grail/asset.schemas.js';

const gameSchemas = {
    "elden-ring": EldenRingSchema,
    "tainted-grail": TaintedGrailSchema
}

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