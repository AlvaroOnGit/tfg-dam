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
const slotCategories = z.enum(["armor", "weapon", "jewelry", "relic", "magic"]);
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
const slotRelicNames = z.enum([
    "relic-0",
    "relic-1",
    "relic-2",
    "relic-3",
    "relic-4",
    "relic-5",
    "relic-6",
    "relic-7",
    "relic-8",
    "relic-9",
    "relic-10",
    "relic-11",
    "relic-12",
    "relic-13",
    "relic-14",
    "relic-15",
    "relic-16",
    "relic-17",
    "relic-18",
    "relic-19",
    "relic-20",
    "relic-21",
    "relic-22",
    "relic-23",
    "relic-24",
    "relic-25",
]);

// ─── Template Data Schemas ───────────────────────────────────────────────────────────

// ─── Build Asset Schema ───────────────────────────────────────────────────────────

const slotNamesByCategory = {
    armor: slotArmorNames.options,
    weapon: slotWeaponNames.options,
    jewelry: slotJewelryNames.options,
    relic: slotRelicNames.options,
    magic: slotWeaponNames.options,
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
        //templateData: templateDataSchema,
        assets: z.array(assetSchema),
    }).superRefine(validateNoDuplicateSlots);

export const TaintedGrailBuildPartialSchema =
    BaseSchema.partial().extend({
        tags: z.array(buildTags).optional(),
        //templateData: templateDataSchema.optional(),
        assets: z.array(assetSchema).optional(),
    }).superRefine(validateNoDuplicateSlots);