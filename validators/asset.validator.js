/**
 * Contains logic to validate assets for different games
 */

import EldenRingSchema from '../schemas/games/elden_ring/asset.schemas.js'
import TaintedGrailSchema from '../schemas/games/tainted_grail/asset.schemas.js';

const gameSchemas = {
    "elden-ring": EldenRingSchema,
    "tainted-grail": TaintedGrailSchema
}

const gameIdToSlug = {
    "550e8400-e29b-41d4-a716-446655440001": "tainted-grail",
    // añade aquí el de Elden Ring cuando lo tengas
}

export async function validateAsset(data) {
    const { gameSlug, gameId } = data

    const slug = gameSlug ?? gameIdToSlug[gameId];

    if (!slug) {
        return {
            success: false,
            error: `Unsupported game: ${gameId ?? gameSlug}`
        };
    }

    const gameSchema = gameSchemas[slug];

    if (!gameSchema) {
        return {
            success: false,
            error: `Unsupported game: ${slug}`
        };
    }

    return await gameSchema.safeParse({ ...data, gameSlug: slug });
}