import { z } from 'zod';
import createBaseBuildSchema from "../../builds.schemas.js";

const BaseSchema = createBaseBuildSchema('elden-ring');

//Enums

const buildTags = z.enum([
    "beginner-friendly",
    "endgame",
    "new-game-plus",
    "solo",
    "co-op",
    "pvp",
    "speedrun",
    "tank",
    "glass-cannon",
    "faith-build",
    "intelligence-build",
    "arcane-build",
    "strength-build",
    "dexterity-build",
    "bleed",
    "poison",
    "frost",
    "magic-focused",
    "melee-focused",
    "ranged-focused",
    "hybrid",
    "min-maxed",
    "budget",
    "no-hit",
]);

//Temple data schema

const templateDataSchema = z.object({
    ashOfWar1: z
        .string("ashOfWar1 must be a string")
        .trim()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be lowercase letters, numbers and single dashes only")
        .min(1, "ashOfWar1 must be at least 1 character long")
        .max(100, "ashOfWar1 cannot exceed 100 characters")
        .nullable(),
    ashOfWar2: z
        .string("ashOfWar2 must be a string")
        .trim()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be lowercase letters, numbers and single dashes only")
        .min(1, "ashOfWar2 must be at least 1 character long")
        .max(100, "ashOfWar2 cannot exceed 100 characters")
        .nullable(),
    ashOfWar3: z
        .string("ashOfWar3 must be a string")
        .trim()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be lowercase letters, numbers and single dashes only")
        .min(1, "ashOfWar3 must be at least 1 character long")
        .max(100, "ashOfWar3 cannot exceed 100 characters")
        .nullable(),
})

// ─── Main Schema ────────────────────────────────────────────────────────────────

const EldenRingBuildSchema =
    BaseSchema.extend({
            tags: z.array(buildTags),
            template_data: templateDataSchema
        }
    );

export default EldenRingBuildSchema;