/**
 * Contains logic to validate assets for different games
 */
import {
    WeaponSchema,
    ArmorSchema,
    TalismanSchema,
    AshOfWarSchema,
    SpiritAshSchema,
} from '../schemas/games/elden-ring.schemas.js';

// Mapa de esquemas según el tipo de asset
const assetSchemas = {
    weapon: WeaponSchema,
    armor: ArmorSchema,
    talisman: TalismanSchema,
    ashOfWar: AshOfWarSchema,
    spiritAsh: SpiritAshSchema,
};

// Función para validar el asset
const validateAsset = (gameId, assetType, data) => {
    if (gameId !== "elden_ring") {
        throw new Error("Invalid game ID");
    }

    const schema = assetSchemas[assetType];
    if (!schema) {
        throw new Error("Invalid asset type");
    }

    return schema.parse(data);
};

export default validateAsset;