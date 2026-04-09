/**
 * Contains logic to validate builds for Tainted Grail
 */


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

// ─── Template Data Schemas ───────────────────────────────────────────────────────────

const relicSchema = z
    .tuple([
        z
            .string("relic slot 1 must be a slug")
            .trim()
            .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be lowercase letters, numbers and single dashes only")
            .min(1, "relic slot 1 must be at least 1 character long")
            .max(100, "relic slot 1 cannot exceed 100 characters")
            .nullable(),
        z
            .string("relic slot 2 must be a slug")
            .trim()
            .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be lowercase letters, numbers and single dashes only")
            .min(1, "relic slot 2 must be at least 1 character long")
            .max(100, "relic slot 2 cannot exceed 100 characters")
            .nullable(),
    ])

const templateDataSchema = z.object({
    cuirass: relicSchema,
    greaves: relicSchema,
    boot: relicSchema,
    gauntlet: relicSchema,
    helmet: relicSchema,
    weaponSlot1: relicSchema,
    weaponSlot2: relicSchema,
    weaponSlot3: relicSchema,
    weaponSlot4: relicSchema,
    weaponSlot5: relicSchema,
    weaponSlot6: relicSchema,
    weaponSlot7: relicSchema,
    weaponSlot8: relicSchema,
})


// ─── Main Schema ────────────────────────────────────────────────────────────────

const TaintedGrailBuildSchema =
    BaseSchema.extend({
            tags: z.array(buildTags),
            templateData: templateDataSchema
        }
    );

export const TaintedGrailBuildUpdateSchema = TaintedGrailBuildSchema.partial();
export default TaintedGrailBuildSchema;