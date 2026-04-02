/**
 * Contains logic to validate builds for Elden Ring
 */

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

// ─── Template Data Schema ───────────────────────────────────────────────────────────

const ashOfWarSlots = ["ashOfWar1", "ashOfWar2", "ashOfWar3"];

const templateDataSchema = z.object(
    Object.fromEntries(
        ashOfWarSlots.map(type => [type, z
            .string(`${type} must be a slug`)
            .trim()
            .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be lowercase letters, numbers and single dashes only")
            .min(1, `${type} must be at least 1 character long`)
            .max(100, `${type} cannot exceed 100 characters`)
            .nullable(),
        ])
    )
);

// ─── Main Schema ────────────────────────────────────────────────────────────────

const EldenRingBuildSchema =
    BaseSchema.extend({
            tags: z.array(buildTags),
            templateData: templateDataSchema
        }
    );

export const EldenRingBuildUpdateSchema = EldenRingBuildSchema.partial();
export default EldenRingBuildSchema;