/**
 * Contains schemas to validate assets for Tainted Grail
 */
import { z } from 'zod';
import createBaseSchema from "../../asset.schemas.js";
import { validateIconUrl } from '../../helpers/asset.helpers.js';

const BaseSchema = createBaseSchema('tainted-grail');

// Enums

const weaponCategories = z.enum([
    "bows",
    "one-handed",
    "two-handed",
    "wands",
    "shields"
]);

const armorCategories = z.enum([
    "cuirasses",
    "greaves",
    "boots",
    "gauntlets",
    "helmets",
    "back"
]);

const jewelryCategories = z.enum([
    "rings",
    "amulets"
])

const relicTypes = z.enum([
    "armor",
    "weapon"
])

// ─── Data Schemas ──────────────────────────────────────────────────────────────

// ────────── Shared Schemas ─────────────────────────────────────────────────────

const damageSchema = z
    .tuple([
        z
            .number()
            .nonnegative("min damage cannot be negative")
            .int("min damage must be an integer")
            .min(1, "min damage must be at least 1")
            .max(9999, "min damage cannot exceed 9999"),
        z
            .number()
            .nonnegative("max damage cannot be negative")
            .int("max damage must be an integer")
            .min(1, "max damage must be at least 1")
            .max(9999, "max damage cannot exceed 9999"),
    ])
    .superRefine(([min, max], ctx) => {
        if (min > max) {
            ctx.addIssue({
                code: "invalid_value",
                received: min,
                message: `min damage must cant exceed max damage: ${max}`,
                path: [0]
            });
        }
    })

const requirementTypes = ["strength","dexterity","spirituality","perception","endurance","practicality"]
const requirementSchema = z.object(
    Object.fromEntries(
        requirementTypes.map(type => [type, z
            .number(`${type} requirement must be a number`)
            .int(`${type} requirement must be an integer`)
            .nonnegative(`${type} requirement cannot be negative`)
            .max(100, `${type} requirement value cannot exceed 100`)
            .nullable()
        ])
    )
);

const goldSchema = z
    .number("gold must be a number" )
    .nonnegative("gold cant be negative")
    .int("gold must be an integer")
    .max(99999, "gold value cannot exceed 99999");

const weightSchema = z
    .number("weight must be a number")
    .nonnegative("weight cannot be negative")
    .multipleOf(0.1, "weight cannot have more than 1 decimal")
    .max(100, "weight cannot exceed 100")
    .nullable();

// ────────── Weapon Schemas ──────────────────────────────────────────────────────

const weaponDataSchema = z.object({
    damage: damageSchema,
    stamina: z
        .number("stamina must be a number")
        .nonnegative("stamina cant be negative")
        .int("stamina must be an integer")
        .min(1, "stamina must be at least 1")
        .max(100, "stamina cannot exceed 100"),
    block: z
        .number("block must be a number")
        .nonnegative("block cant be negative")
        .int("block must be an integer")
        .min(1, "block must be at least 1")
        .max(100, "block cannot exceed 100")
        .nullable(),
    gold: goldSchema,
    weight: weightSchema,
    requirements: requirementSchema
});

// ────────── Armor Schemas ───────────────────────────────────────────────────────

const armorDataSchema = z.object({
    armor: z
        .number("armor must be a number")
        .nonnegative("armor cant be negative")
        .multipleOf(0.1, "armor cannot have more than 1 decimal")
        .min(1, "armor must be at least 1")
        .max(100, "armor cannot exceed 100"),
    gold: goldSchema,
    weight: weightSchema,
    requirements: requirementSchema
})

// ────────── Jewelry Schemas ─────────────────────────────────────────────────────

const jewelryDataSchema = z.object({
    gold: goldSchema,
    weight: weightSchema,
})

// ────────── Magic Schemas ───────────────────────────────────────────────────────

const castSchema = z.object({
    damage: damageSchema.nullable(),
    type: z.enum([
        "area-of-effect",
        "channeled",
        "buff",
        "projectile",
        "ray",
        "trap",
        "summon"
    ]),
    mana: z
        .number("mana must be a number")
        .nonnegative("mana cant be negative")
        .int("mana must be an integer")
        .min(1, "mana must be at least 1")
        .max(500, "mana cannot exceed 500")
        .nullable(),
    health: z
        .number("health must be a number")
        .nonnegative("health cant be negative")
        .int("health must be an integer")
        .min(1, "health must be at least 1")
        .max(500, "health cannot exceed 500")
        .nullable(),
    healthCost: z
        .number("health cost must be a number")
        .nonnegative("health cost cant be negative")
        .int("health cost must be an integer")
        .min(1, "health cost must be at least 1")
        .max(500, "health cost cannot exceed 500")
        .nullable(),
    effect: z
        .string("effect must be a string")
        .max(500, "effect length cant exceed 500 characters"),
});

const magicSchema = z.object({
    lightCast: castSchema.nullable(),
    heavyCast: castSchema.nullable(),
})

const magicDataSchema = z.object({
    magic: magicSchema,
    gold: goldSchema,
    weight: weightSchema,
    requirements: requirementSchema
})

// ────────── Relic Schemas ───────────────────────────────────────────────────────

 const relicDataSchema = z.object({
     gold: goldSchema,
     weight: weightSchema,
     effect: z
         .array(
             z.string("effect must be a string")
             .max(500, "effect length cant exceed 500 characters"))
         .nullable(),
 })

// ─── Main Schema ────────────────────────────────────────────────────────────────

/**
 * Ensures the `block` field is not null
 * for weapons with categories that require blocking, such as shields or wands.
 * Adds a Zod issue if `block` is null in these cases.
 */
const validateBlock = (obj, ctx) => {
    if (obj.category === "shields" || obj.category === "wands") {
        if (obj.data.block === null) {
            ctx.addIssue({
                code: "invalid_value",
                received: null,
                message: `block cannot be null for ${obj.category}`,
                path: ["data", "block"]
            });
        }
    }
}

const TaintedGrailSchema = z.discriminatedUnion("assetType", [

    BaseSchema.extend({
        assetType: z.literal("weapon"),
        category: weaponCategories,
        data: weaponDataSchema,
    }).superRefine(validateIconUrl).superRefine(validateBlock),

    BaseSchema.extend({
        assetType: z.literal("armor"),
        category: armorCategories,
        data: armorDataSchema,
    }).superRefine(validateIconUrl),

    BaseSchema.extend({
        assetType: z.literal("jewelry"),
        category:  jewelryCategories,
        data: jewelryDataSchema,
    }).superRefine(validateIconUrl),

    BaseSchema.extend({
        assetType: z.literal("magic"),
        category: z.null(),
        data: magicDataSchema,
    }).superRefine(validateIconUrl),

    BaseSchema.extend({
        assetType: z.literal("relic"),
        category:  relicTypes,
        data: relicDataSchema,
    }).superRefine(validateIconUrl)
]);

export default TaintedGrailSchema;