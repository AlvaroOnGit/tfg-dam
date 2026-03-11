import { z } from 'zod';
import createBaseBuildSchema from "../../builds.schemas.js";

const BaseSchema = createBaseBuildSchema('tainted-grail');

// Enums

const buildTags = z.enum([
    "beginner-friendly",
    "endgame",
    "solo",
    "co-op",
    "speedrun",
    "tank",
    "glass-cannon",
    "stealth",
    "magic-focused",
    "melee-focused",
    "ranged-focused",
    "hybrid",
    "min-maxed",
    "budget",
]);

// ────────── Temple Data Schemas ───────────────────────────────────────────────────────

const armorRelicSchema = z.object({
    armorRelic1: z
        .string("armorRelic1 must be a string")
        .trim()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be lowercase letters, numbers and single dashes only")
        .min(1, "armorRelic1 must be at least 1 character long")
        .max(100, "armorRelic1 cannot exceed 100 characters")
        .nullable(),
    armorRelic2: z
        .string("armorRelic2 must be a string")
        .trim()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be lowercase letters, numbers and single dashes only")
        .min(1, "armorRelic2 must be at least 1 character long")
        .max(100, "armorRelic2 cannot exceed 100 characters")
        .nullable(),
})

const weaponRelicSchema = z.object({
    weaponRelic1: z
        .string("weaponRelic1 must be a string")
        .trim()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be lowercase letters, numbers and single dashes only")
        .min(1, "weaponRelic1 must be at least 1 character long")
        .max(100, "weaponRelic1 cannot exceed 100 characters")
        .nullable(),
    weaponRelic2: z
        .string("weaponRelic2 must be a string")
        .trim()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be lowercase letters, numbers and single dashes only")
        .min(1, "weaponRelic1 must be at least 1 character long")
        .max(100, "weaponRelic1 cannot exceed 100 characters")
        .nullable(),
})

const templateDataSchema = z.object({
    cuirass: armorRelicSchema,
    greaves: armorRelicSchema,
    boot: armorRelicSchema,
    gauntlet: armorRelicSchema,
    helmet: armorRelicSchema,
    weaponSlot1: weaponRelicSchema,
    weaponSlot2: weaponRelicSchema,
    weaponSlot3: weaponRelicSchema,
    weaponSlot4: weaponRelicSchema,
    weaponSlot5: weaponRelicSchema,
    weaponSlot6: weaponRelicSchema,
    weaponSlot7: weaponRelicSchema,
    weaponSlot8: weaponRelicSchema,
})


// ─── Main Schema ────────────────────────────────────────────────────────────────

const TaintedGrailBuildSchema =
    BaseSchema.extend({
            tags: z.array(buildTags),
            template_data: templateDataSchema
        }
    );

export default TaintedGrailBuildSchema;