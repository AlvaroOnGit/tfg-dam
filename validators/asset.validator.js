/**
 * Contains logic to validate assets for different games
 */
import {
  WeaponSchema,
  ArmorSchema,
  TalismanSchema,
  AshOfWarSchema,
  SpiritAshSchema
} from "../schemas/games/elden-ring.schemas.js";

// Mapear los esquemas según juego y tipo de asset
const gameSchemas = {
  elden_ring: {
    weapon: WeaponSchema,
    armor: ArmorSchema,
    talisman: TalismanSchema,
    ash_of_war: AshOfWarSchema,
    spirit_ash: SpiritAshSchema,
  }
};

/**
 * Valida cualquier asset de cualquier juego definido en gameSchemas
 * @param {string} gameId - ID del juego (ej: "elden_ring")
 * @param {string} assetType - Tipo de asset (ej: "weapon")
 * @param {object} data - Datos del asset a validar
 * @returns {object} Resultado de la validación:
 *   { success: true, data } si es válido
 *   { success: false, errors } si hay errores
 */
const validateAsset = (gameId, assetType, data) => {
  const game = gameSchemas[gameId];
  if (!game) {
    return {
      success: false,
      errors: { gameId: `Game ID "${gameId}" no soportado` }
    };
  }

  const schema = game[assetType];
  if (!schema) {
    return {
      success: false,
      errors: { assetType: `Asset type "${assetType}" no válido para ${gameId}` }
    };
  }

  const result = schema.safeParse(data);

  if (!result.success) {
    // Formatea los errores por campo
    return {
      success: false,
      errors: result.error.format()
    };
  }

  return { success: true, data: result.data };
};

export default validateAsset;
