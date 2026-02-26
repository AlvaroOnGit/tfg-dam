/**
 * Contains schemas to validate assets for Tainted Grail
 */
import { z} from "zod";
import assetBaseSchema from "./asset-base.schema.js";

// ─── Shared Schemas ───────────────────────────────────────────────────────────

const RequiresSchema = z.object({
    strength:     z.number({ error: "Strength must be a number" }).nonnegative("Strength cannot be negative").int("Strength must be an integer").optional(),
    dexterity:    z.number({ error: "Dexterity must be a number" }).nonnegative("Dexterity cannot be negative").int("Dexterity must be an integer").optional(),
    spirituality: z.number({ error: "Spirituality must be a number" }).nonnegative("Spirituality cannot be negative").int("Spirituality must be an integer").optional(),
    perception:   z.number({ error: "Perception must be a number" }).nonnegative("Perception cannot be negative").int("Perception must be an integer").optional(),
    endurance:    z.number({ error: "Endurance must be a number" }).nonnegative("Endurance cannot be negative").int("Endurance must be an integer").optional(),
    practicality: z.number({ error: "Practicality must be a number" }).nonnegative("Practicality cannot be negative").int("Practicality must be an integer").optional(),
});

const CastSchema = z.object({
    damage:      z.number({ error: "Damage must be a number" }).nonnegative("Damage cannot be negative").int("Damage must be an integer"),
    typeOfSpell: z.string({ error: (issue) => issue.input === undefined ? "Type of spell is required" : "Type of spell must be a string" }),
    manaCost:    z.number({ error: "Mana cost must be a number" }).nonnegative("Mana cost cannot be negative").int("Mana cost must be an integer"),
    description: z.string({ error: (issue) => issue.input === undefined ? "Description is required" : "Description must be a string" }),
});

const CastTypeSchema = z.discriminatedUnion("type", [
    z.object({ type: z.literal("lightCast") }).extend(CastSchema.shape),
    z.object({ type: z.literal("heavyCast") }).extend(CastSchema.shape),
]);

// ─── Data Schemas ─────────────────────────────────────────────────────────────

const WeaponDataSchema = z.object({
    gold:        z.number({ error: "Gold price must be a number" }).nonnegative("Gold price cannot be negative").int("Gold price must be an integer"),
    weight:      z.number({ error: "Weight must be a number" }).nonnegative("Weight cannot be negative").int("Weight must be an integer").max(100, "Weight cannot exceed 100"),
    damage:      z.number({ error: "Damage must be a number" }).nonnegative("Damage cannot be negative").int("Damage must be an integer"),
    staminaCost: z.number({ error: "Stamina cost must be a number" }).nonnegative("Stamina cost cannot be negative").int("Stamina cost must be an integer"),
    requires:    RequiresSchema,
    block:       z.number({ error: "Block must be a number" }).nonnegative("Block cannot be negative").int("Block must be an integer").optional(),
});

const ArmorDataSchema = z.object({
    gold:     z.number({ error: "Gold price must be a number" }).nonnegative("Gold price cannot be negative").int("Gold price must be an integer"),
    weight:   z.number({ error: "Weight must be a number" }).nonnegative("Weight cannot be negative").int("Weight must be an integer").max(100, "Weight cannot exceed 100"),
    armor:    z.number({ error: "Armor must be a number" }).nonnegative("Armor cannot be negative").int("Armor must be an integer"),
    requires: RequiresSchema,
});

const JewelryDataSchema = z.object({
    gold:   z.number({ error: "Gold price must be a number" }).nonnegative("Gold price cannot be negative").int("Gold price must be an integer"),
    weight: z.number({ error: "Weight must be a number" }).nonnegative("Weight cannot be negative").max(100, "Weight cannot exceed 100"),
});

const MagicDataSchema = z.object({
    gold:       z.number({ error: "Gold price must be a number" }).nonnegative("Gold price cannot be negative").int("Gold price must be an integer"),
    weight:     z.number({ error: "Weight must be a number" }).nonnegative("Weight cannot be negative").int("Weight must be an integer").max(100, "Weight cannot exceed 100"),
    effectLink: z.string({ error: (issue) => issue.input === undefined ? "Effect link is required" : "Effect link must be a string" }).optional(),
    castType:   CastTypeSchema,
    item:       z.string({ error: (issue) => issue.input === undefined ? "Item is required" : "Item must be a string" }),
});

const RelicDataSchema = z.object({
    gold:       z.number({ error: "Gold price must be a number" }).nonnegative("Gold price cannot be negative").int("Gold price must be an integer"),
    weight:     z.number({ error: "Weight must be a number" }).nonnegative("Weight cannot be negative").int("Weight must be an integer").max(100, "Weight cannot exceed 100"),
    effectLink: z.string({ error: (issue) => issue.input === undefined ? "Effect link is required" : "Effect link must be a string" }),
});

// ─── Main Schema ──────────────────────────────────────────────────────────────

const TaintedGrailSchema = z.discriminatedUnion("assetType", [

    assetBaseSchema.extend({
        assetType: z.literal("Weapon"),
        category:  z.enum(["Bow", "Onehanded", "Twohanded", "Wand", "Shield"], { error: "Category for Weapon must be one of: Bow, Onehanded, Twohanded, Wand, Shield" }),
        data:      WeaponDataSchema,
    }).superRefine((obj, ctx) => {
        if (obj.category === "Shield" || obj.category === "Wand") {
            if (obj.data.block === undefined || obj.data.block === null) {
                ctx.addIssue({
                    code: z.core.$ZodIssueCode.custom,
                    path: ["data", "block"],
                    message: `Block is required for ${obj.category}`,
                });
            }
        }
    }),

    assetBaseSchema.extend({
        assetType: z.literal("Armor"),
        category:  z.enum(["Helmet", "Cuirass", "Gauntlets", "Greaves", "Boots", "Back"], { error: "Category for Armor must be one of: Helmet, Cuirass, Gauntlets, Greaves, Boots, Back" }),
        data:      ArmorDataSchema,
    }),

    assetBaseSchema.extend({
        assetType: z.literal("Jewelry"),
        category:  z.enum(["Ring", "Amulet"], { error: "Category for Jewelry must be one of: Ring, Amulet" }),
        data:      JewelryDataSchema,
    }),

    assetBaseSchema.extend({
        assetType: z.literal("Magic"),
        data:      MagicDataSchema,
    }),

    assetBaseSchema.extend({
        assetType: z.literal("Relic"),
        category:  z.enum(["Armor", "Weapon"], { error: "Category for Relic must be one of: Armor, Weapon" }),
        data:      RelicDataSchema,
    }),

]);

export default TaintedGrailSchema;