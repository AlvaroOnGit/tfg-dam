/**
 * Contains logic to validate builds for Elden Ring
 */

import { z } from 'zod';
import createBaseBuildSchema from "../../builds.schemas.js";
import { validateNoDuplicateSlots, validateSlotName } from '../../helpers/slot.helpers.js'

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
const slotCategories = z.enum(["armor", "weapon", "talisman", "spell"]);
const slotArmorNames = z.enum([
    "armor-0",
    "armor-1",
    "armor-2",
    "armor-3"
]);
const slotWeaponNames = z.enum([
    "weapon-0",
    "weapon-1",
    "weapon-2",
    "weapon-3",
    "weapon-4",
    "weapon-5"
]);
const slotTalismanNames = z.enum([
    "talisman-0",
    "talisman-1",
    "talisman-2",
    "talisman-3"
]);
const slotSpellNames = z.enum([
    "spell-0",
    "spell-1",
    "spell-2",
    "spell-3",
    "spell-4",
    "spell-5",
    "spell-6",
    "spell-7",
    "spell-8",
    "spell-9"
]);

// ─── Template Data Schema ───────────────────────────────────────────────────────

const ashOfWarSlots = ["ashOfWar1", "ashOfWar2", "ashOfWar3"];

const templateDataSchema = z.object(
    Object.fromEntries(
        ashOfWarSlots.map(type => [type, z
            .uuidv4(`${type} must be a valid v4 uuid`)
            .nullable()
        ])
    )
);

// ─── Build Asset Schema ───────────────────────────────────────────────────────────

const slotNamesByCategory = {
    armor: slotArmorNames.options,
    weapon: slotWeaponNames.options,
    talisman: slotTalismanNames.options,
    spell: slotSpellNames.options,
};

const assetSchema = z.object({
    assetId: z.uuidv4("assetId must be a valid v4 uuid"),
    slotCategory: slotCategories,
    slotName: z.string().optional(),
}).superRefine(validateSlotName(slotNamesByCategory))

// ─── Main Schema ────────────────────────────────────────────────────────────────

export const EldenRingBuildSchema =
    BaseSchema.extend({
            tags: z.array(buildTags),
            templateData: templateDataSchema,
            assets: z.array(assetSchema),
    }).superRefine(validateNoDuplicateSlots);

export const EldenRingBuildPartialSchema =
    BaseSchema.partial().extend({
        tags: z.array(buildTags).optional(),
        templateData: templateDataSchema.optional(),
        assets: z.array(assetSchema).optional(),
    }).superRefine(validateNoDuplicateSlots);

