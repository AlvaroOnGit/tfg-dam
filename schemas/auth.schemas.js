/**
 * Contains schemas to validate user credentials
 */
import {z} from "zod";

// ═══════════════════════════════════════════════════════════════════════════════
//  SHARED
// ═══════════════════════════════════════════════════════════════════════════════

const AvailabilityEnum = z.enum(["Act 1", "Act 2", "Act 3", "SoS", "KoA"], {
    error: "Availability debe ser: 'Act 1', 'Act 2', 'Act 3', 'SoS' o 'KoA'",
});

// ═══════════════════════════════════════════════════════════════════════════════
//  JEWELRY
// ═══════════════════════════════════════════════════════════════════════════════

// ── Enums ────────────────────────────────────────────────────────────────────

const JewelrySubtypeEnum = z.enum(["amulet", "ring"], {
    error: "El subtipo de joya debe ser 'amulet' o 'ring'",
});

// ── Value ────────────────────────────────────────────────────────────────────

const JewelryValueSchema = z.object({
    gold:   z.number({ required_error: "El precio en oro es obligatorio", invalid_type_error: "El precio en oro debe ser un número" })
        .nonnegative("El precio en oro no puede ser negativo"),
    weight: z.number({ required_error: "El peso es obligatorio", invalid_type_error: "El peso debe ser un número" })
        .nonnegative("El peso no puede ser negativo"),
});

// ── Main schema ───────────────────────────────────────────────────────────────

const JewelryDataSchema = z.object({
    subtype:      JewelrySubtypeEnum,
    tier:         z.number({ invalid_type_error: "El tier debe ser un número entero positivo" })
        .int("El tier debe ser un número entero")
        .positive("El tier debe ser mayor que 0")
        .nullable(),
    description:  z.string({ required_error: "La descripción es obligatoria", invalid_type_error: "La descripción debe ser un texto" })
        .min(1, "La descripción no puede estar vacía"),
    availability: AvailabilityEnum.nullable(),
    craftable:    z.boolean({ required_error: "El campo craftable es obligatorio", invalid_type_error: "El campo craftable debe ser true o false" }),
    value:        JewelryValueSchema,
});

// ═══════════════════════════════════════════════════════════════════════════════
//  ARMOR
// ═══════════════════════════════════════════════════════════════════════════════

// ── Enums ────────────────────────────────────────────────────────────────────

const ArmorSlotEnum = z.enum(["helmet", "cuirass", "gauntlets", "greaves", "boots", "back"], {
    error: "El slot debe ser: 'helmet', 'cuirass', 'gauntlets', 'greaves', 'boots' o 'back'",
});

const EffectLinkEnum = z.enum(["critical_hit", "frozen", "bleeding", "burning", "poisoned", "stunned"], {
    error: "El effect_link debe ser un estado válido del juego",
});

// ── Requirements ─────────────────────────────────────────────────────────────

const ArmorRequirementsSchema = z.object({
    strength:  z.number({ invalid_type_error: "La fuerza requerida debe ser un número" })
        .int("La fuerza debe ser un número entero")
        .positive("La fuerza debe ser mayor que 0")
        .optional(),
    endurance: z.number({ invalid_type_error: "La resistencia requerida debe ser un número" })
        .int("La resistencia debe ser un número entero")
        .positive("La resistencia debe ser mayor que 0")
        .optional(),
});

// ── Value ────────────────────────────────────────────────────────────────────

const ArmorValueSchema = z.object({
    gold:   z.number({ required_error: "El precio en oro es obligatorio", invalid_type_error: "El precio en oro debe ser un número" })
        .nonnegative("El precio en oro no puede ser negativo"),
    weight: z.number({ required_error: "El peso es obligatorio", invalid_type_error: "El peso debe ser un número" })
        .nonnegative("El peso no puede ser negativo"),
});

// ── Main schema ───────────────────────────────────────────────────────────────

const ArmorDataSchema = z.object({
    armor:        z.number({ required_error: "El valor de armadura es obligatorio", invalid_type_error: "El valor de armadura debe ser un número" })
        .nonnegative("El valor de armadura no puede ser negativo"),
    slot:         ArmorSlotEnum,
    description:  z.string({ required_error: "La descripción es obligatoria", invalid_type_error: "La descripción debe ser un texto" })
        .min(1, "La descripción no puede estar vacía"),
    effect_link:  EffectLinkEnum.nullable(),
    set_name:     z.string({ invalid_type_error: "El nombre del set debe ser un texto" }).nullable(),
    requirements: ArmorRequirementsSchema.nullable(),
    availability: AvailabilityEnum.nullable(),
    craftable:    z.boolean({ required_error: "El campo craftable es obligatorio", invalid_type_error: "El campo craftable debe ser true o false" }),
    value:        ArmorValueSchema,
});

// ═══════════════════════════════════════════════════════════════════════════════
//  EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
    // Shared
    AvailabilityEnum,
    // Jewelry
    JewelryDataSchema,
    JewelryValueSchema,
    JewelrySubtypeEnum,
    // Armor
    ArmorDataSchema,
    ArmorValueSchema,
    ArmorSlotEnum,
    ArmorRequirementsSchema,
    EffectLinkEnum,
};