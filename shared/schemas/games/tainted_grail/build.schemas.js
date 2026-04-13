/**
 * Contains logic to validate builds for Tainted Grail
 */


import { z } from 'zod';
import createBaseBuildSchema from "../../builds.schemas.js";
import { validateNoDuplicateSlots, validateSlotName } from '../../helpers/slot.helpers.js'

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
const slotCategories = z.enum(["armor", "weapon", "jewelry"]);
const slotArmorNames = z.enum([
    "armor-0",
    "armor-1",
    "armor-2",
    "armor-3",
    "armor-4",
]);
const slotWeaponNames = z.enum([
    "weapon-0",
    "weapon-1",
    "weapon-2",
    "weapon-3",
    "weapon-4",
    "weapon-5",
    "weapon-6",
    "weapon-7"
]);
const slotJewelryNames = z.enum([
    "jewelry-0",
    "jewelry-1",
    "jewelry-2",
]);

// ─── Template Data Schemas ───────────────────────────────────────────────────────────

const relicSchema = z
    .tuple([
        z
            .uuidv4("relic slot 1 must be a valid v4 uuid")
            .nullable(),
        z
            .uuidv4("relic slot 2 must be a valid v4 uuid")
            .nullable(),
    ])

const templateDataSchema = z.object({
    cuirass: relicSchema.nullable(),
    greaves: relicSchema.nullable(),
    boot: relicSchema.nullable(),
    gauntlet: relicSchema.nullable(),
    helmet: relicSchema.nullable(),
    weaponSlot1: relicSchema.nullable(),
    weaponSlot2: relicSchema.nullable(),
    weaponSlot3: relicSchema.nullable(),
    weaponSlot4: relicSchema.nullable(),
    weaponSlot5: relicSchema.nullable(),
    weaponSlot6: relicSchema.nullable(),
    weaponSlot7: relicSchema.nullable(),
    weaponSlot8: relicSchema.nullable(),
})

// ─── Build Asset Schema ───────────────────────────────────────────────────────────

const slotNamesByCategory = {
    armor: slotArmorNames.options,
    weapon: slotWeaponNames.options,
    jewelry: slotJewelryNames.options,
};

const assetSchema = z.object({
    assetId: z.uuidv4("assetId must be a valid v4 uuid"),
    slotCategory: slotCategories,
    slotName: z.string().optional(),
}).superRefine(validateSlotName(slotNamesByCategory))


// ─── Main Schema ────────────────────────────────────────────────────────────────

export const TaintedGrailBuildSchema =
    BaseSchema.extend({
            tags: z.array(buildTags),
            templateData: templateDataSchema,
            assets: z.array(assetSchema),
    }).superRefine(validateNoDuplicateSlots);

export const TaintedGrailBuildPartialSchema =
    BaseSchema.partial().extend({
        tags: z.array(buildTags).optional(),
        templateData: templateDataSchema.optional(),
        assets: z.array(assetSchema).optional(),
    }).superRefine(validateNoDuplicateSlots);