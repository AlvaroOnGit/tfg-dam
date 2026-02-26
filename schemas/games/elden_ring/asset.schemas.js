/**
 * Contains schemas to validate assets for Elden Ring
 */

import { z } from 'zod';
import BaseSchema from '../../asset.schemas.js';

// Enums

const weaponCategories = z.enum([
    "daggers",
    "straight-swords",
    "greatswords",
    "colossal-swords",
    "thrusting-swords",
    "heavy-thrusting-swords",
    "curved-swords",
    "curved-greatswords",
    "katanas",
    "twinblades",
    "axes",
    "greataxes",
    "hammers",
    "flails",
    "great-hammers",
    "colossal-weapons",
    "spears",
    "great-spears",
    "halberds",
    "reapers",
    "whips",
    "fists",
    "claws",
    "light-bows",
    "bows",
    "greatbows",
    "crossbows",
    "ballistas",
    "staffs",
    "seals",
    "torches",
    "thrusting-shields",
    "hand-to-hand-arts",
    "throwing-blades",
    "backhand-blades",
    "perfumes",
    "beast-claws",
    "light-greatswords",
    "great-katanas",
    "shields"
]);

const armorCategories = z.enum([
    "helmets",
    "chest",
    "gauntlets",
    "legs"
]);

const spellCategories = z.enum([
    "incantations",
    "sorceries"
]);

// ─── Data Schemas ─────────────────────────────────────────────────────────────

// ───────── Shared Schemas ─────────────────────────────────────────────────────

const weightSchema = z
    .number("value must be a number")
    .nonnegative("value cannot be negative")
    .multipleOf(0.1, "value cannot have more than 1 decimal")
    .max(100, "value cannot exceed 100");

// ───────── Weapon Schemas ─────────────────────────────────────────────────────

const attackTypes = ["physical","magical","fire","lightning","holy","critical"];
const guardTypes = ["physical","magical","fire","lightning","holy","boost"];
const attributeTypes = ["strength","dexterity","intelligence","faith","arcane"];

const weaponDamage = z.enum(["pierce","slash","blunt"]);

const weaponAttackSchema = z.object(
    Object.fromEntries(
        attackTypes.map(type => [type, z
            .number(`${type} attack must be a number`)
            .int(`${type} attack must be an integer`)
            .nonnegative(`${type} attack cannot be negative`)
            .max(999, "attack value cannot exceed 999")
        ])
    )
);

const weaponGuardSchema = z.object(
    Object.fromEntries(
        guardTypes.map(type => [type, z
            .number(`${type} guard must be a number`)
            .int(`${type} guard must be an integer`)
            .nonnegative(`${type} guard cannot be negative`)
            .max(100, "guard value cannot exceed 100")
        ])
    )
);

const weaponScalingSchema = z.object(
    Object.fromEntries(
        attributeTypes.map(type => [type, z
            .enum(["S","A","B","C","D","E"])
            .nullable()
        ])
    )
);

const weaponRequirementsSchema = z.object(
    Object.fromEntries(
        attributeTypes.map(type => [type, z
            .number(`${type} value must be a number`)
            .int(`${type} value must be an integer`)
            .max(100, "requirement value cannot exceed 100")
            .nonnegative(`${type} value cannot be negative`)
            .nullable()
        ])
    )
);

const weaponDamageSchema = z
    .array(weaponDamage)
    .min(1, "a weapon must have at least 1 damage type")
    .max(2, "a weapon can only have 2 damage types");

const weaponAowSchema = z.object({
    slug: z
        .string("value must be a string")
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be lowercase letters, numbers and single dashes only"),
    compatible: z.boolean().default(true),
})

const weaponEffectSchema = z.object({
    effect: z
        .enum(["hemorrhage","poison","scarlet-rot","frostbite","sleep","madness","death-blight"])
        .nullable(),
    value: z
        .number("value must be a number")
        .nonnegative("value cannot be negative")
        .int("value must be an integer")
        .max(200, "value cannot exceed 200")
        .nullable(),

}).superRefine((data, ctx) => {

    if (data.effect === null && data.value !== null) {
        ctx.addIssue({
            code: "invalid_type",
            expected: "null",
            received: typeof data.value,
            message: "value must be null if effect is null",
            path: ["value"],
        });
    }

    if (data.effect !== null && data.value === null) {
        ctx.addIssue({
            code: "invalid_type",
            expected: "number",
            received: "null",
            message: "value is required when effect is present",
            path: ["value"],
        });
    }
});

const weaponDataSchema = z.object({
    attack: weaponAttackSchema,
    guard: weaponGuardSchema,
    scaling: weaponScalingSchema,
    requires: weaponRequirementsSchema,
    damage: weaponDamageSchema,
    aow: weaponAowSchema,
    effect: weaponEffectSchema,
    weight: weightSchema
});

// ───────── Armor Schemas ─────────────────────────────────────────────────────

const negationTypes = ["physical","strike","slash","pierce","magical","fire","lightning","holy"];
const resistanceTypes = ["immunity","robustness","focus","vitality","poise"];

const armorNegationSchema = z.object(
    Object.fromEntries(
        negationTypes.map(type => [type, z
            .number(`${type} value must be a number`)
            .max(100,`${type} value cannot exceed 100`)
            .multipleOf(0.1, `${type} value cannot have more than 1 decimal`)
            .nonnegative(`${type} value cannot be negative`)
        ])
    )
);

const armorResistanceSchema = z.object(
    Object.fromEntries(
        resistanceTypes.map(type => [type, z
            .number(`${type} value must be a number`)
            .max(100,`${type} value cannot exceed 100`)
            .int(`${type} value must be an integer`)
            .nonnegative(`${type} value cannot be negative`)
        ])
    )
);

const armorDataSchema = z.object({
    negation: armorNegationSchema,
    resistance: armorResistanceSchema,
    weight: weightSchema
});

// ───────── Spell Schemas ───────────────────────────────────────────────────────

const spellSorceryTypes = [
    "carian",
    "cold",
    "crystalian",
    "death",
    "finger",
    "glintstone",
    "gravity",
    "magma",
    "night",
    "oracle",
    "thorn"
];
const spellIncantationTypes = [
    "bestial",
    "black-flame",
    "blood-oath",
    "dragon-communion",
    "dragon-cult",
    "erdtree",
    "frenzied-flame",
    "giants-flame",
    "golden-order",
    "messmers-flame",
    "miquellan",
    "servants-of-rot",
    "spiral-tower",
    "two-fingers"
];

const spellRequirementTypes = ["intelligence", "faith", "arcane"]
const spellRequirementsSchema = z.object(
    Object.fromEntries(
        spellRequirementTypes.map(type => [type, z
            .number(`${type} value must be a number`)
            .int(`${type} value must be an integer`)
            .max(100, `${type} value must not exceed 100`)
            .nonnegative(`${type} value cannot be negative`)
            .nullable()
        ])
    )
).superRefine((data, ctx) => {
    if (data.intelligence === null && data.faith === null && data.arcane === null) {
        ctx.addIssue({
            code: "invalid_type",
            expected: "number",
            received: "null",
            message: "all requirements cannot be null",
            path: ["intelligence","faith","arcane"],
        });
    }
});

const spellDataSchema = z.object({
    spellType: z.string(),
    cost: z
        .number("cost must be a number")
        .int("cost must be an integer")
        .nonnegative("cost cannot be negative")
        .max(100, "cost cannot exceed 100")
        .min(1, "cost must exceed 1"),
    slots: z
        .number("slots must be a number")
        .int("slots must be an integer")
        .nonnegative("slots cannot be negative")
        .max(3, "slots cannot exceed 3")
        .min(1, "slots must be at least 1"),
    requirements: spellRequirementsSchema
});

// ───────── Talisman Schemas ────────────────────────────────────────────────────

const talismanDataSchema = z.object({
    effect: z
        .string("effect must be a string")
        .trim()
        .min(1, "effect cannot be empty")
        .max(200, "effect cannot exceed 200 characters")
        .regex(
            /^[A-Za-z0-9\s+%()\-→↑]+$/,
            "effect can only contain letters, numbers, spaces, %, +, parentheses, arrows, and hyphens"
        )
        .refine(
            val => !val.match(/\d+%.*%/),
            "effect cannot contain more than one % per number"
        ),
    weight: weightSchema
});

// ───────── Ash of War Schemas ──────────────────────────────────────────────────

const ashOfWarDataSchema = z.object({
    affinity: z.enum([
        "standard",
        "heavy",
        "keen",
        "quality",
        "magic",
        "frost",
        "fire",
        "flame-art",
        "lightning",
        "sacred",
        "poison",
        "blood",
        "occult"
    ]),
    cost: z
        .number("cost must be a number")
        .int("cost must be an integer")
        .nonnegative("cost cannot be negative")
        .max(100, "cost cannot exceed 100"),
    allowedWeapons: z.array(weaponCategories).min(1, "must have a minimum of 1 allowed weapon")
})

// ───────── Spirit Ash Schemas ──────────────────────────────────────────────────

const costTypes = ["fp","hp"]

const spiritAshCostSchema = z.object(
    Object.fromEntries(
        costTypes.map(type => [type, z
            .number(`${type} value must be a number`)
            .max(999,`${type} value cannot exceed 999`)
            .min(1, `${type} value must exceed 1`)
            .int(`${type} value must be an integer`)
            .nonnegative(`${type} value cannot be negative`)
            .nullable()
        ])
    )
).superRefine((data, ctx) => {
    const { fp, hp } = data;

    if (fp === null && hp === null){
        ctx.addIssue({
            code: "custom",
            expected: "number",
            received: "null",
            message: "both fields cannot be null",
            path: ["fp","hp"]
        });
    }
    if (fp !== null && hp !== null){
        ctx.addIssue({
            code: "custom",
            expected: "number",
            received: "null",
            message: "Both fields cannot have a value",
            path: ["fp","hp"]
        });
    }
});

const spiritAshDataSchema = z.object({
    cost: spiritAshCostSchema
})

// ───────── Main Schema ──────────────────────────────────────────────────

const EldenRingSchema = z.discriminatedUnion("type", [

    BaseSchema.extend({
        type: z.literal("weapons"),
        category: weaponCategories,
        data: weaponDataSchema
    }),

    BaseSchema.extend({
        type: z.literal("armors"),
        category: armorCategories,
        data: armorDataSchema
    }),

    BaseSchema.extend({
        type: z.literal("spells"),
        category: spellCategories,
        data: spellDataSchema
    }).superRefine((obj, ctx) => {

        if (obj.category === "incantations") {
            if (!spellIncantationTypes.includes(obj.spellType)) {
                ctx.addIssue({
                    code: "invalid_type",
                    message: `Invalid type for incantation, expected one of: ${spellIncantationTypes.join(", ")}`,
                    path: ["data", "spellType"]
                });
            }
        }

        if (obj.category === "sorceries") {
            if (!spellSorceryTypes.includes(obj.spellType)) {
                ctx.addIssue({
                    code: "invalid_type",
                    message: `Invalid type for sorcery, expected one of: ${spellSorceryTypes.join(", ")}`,
                    path: ["data", "spellType"]
                });
            }
        }
    }),

    BaseSchema.extend({
        type: z.literal("talismans"),
        category: z.null(),
        data: talismanDataSchema
    }),

    BaseSchema.extend({
        type: z.literal("ashes-of-war"),
        category: z.null(),
        data: ashOfWarDataSchema
    }),

    BaseSchema.extend({
        type: z.literal("spirit-ashes"),
        category: z.null(),
        data: spiritAshDataSchema
    })
]);

export default EldenRingSchema;