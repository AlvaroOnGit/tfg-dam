/**
 * Contains schemas to validate assets for Tainted Grail
 */
import { z} from "zod";

const AssetTypeEnum = ["Armor", "Jewelry", "Magic", "Relic", "Weapon"];

const CategoryByAssetType = {
    weapons: ["Bow", "Onehanded", "Shield", "Twohanded", "Wand"],
    armors: ["Helmet", "Cuirass", "Gauntlets", "Greaves", "Boots", "Back"],
    jewelry: ["Ring", "Amulet"],
    magic: [],
    relics: ["Armor", "Weapon"],
}

const TagEnum = [
    // Combat style
    "melee",
    "ranged",
    "magic",
    // Weapon type
    "one_handed",
    "two_handed",
    "shield",
    // Item rarity
    "common",
    "rare",
    "unique",
    // Item nature
    "crafted",
    "cursed",
    "wyrdness",
    "arthurian",
    // Game zone
    "horns_of_the_south",
    "cuanacht",
    "forlorn_swords",
    // Origin
    "keeper",
    "druid",
    "fomorian",
    "avalon",
];
const TagEnumSchema = z.enum(TagEnum, {
    error: "Tag must be a valid Tainted Grail tag",
});


const DataSchema = z.object({
    gold: z.number({ required_error: "Gold price is required", invalid_type_error: "Gold price must be a number" })
        .nonnegative("Gold price cannot be negative")
        .int("Gold price must be an integer"),
    weight: z.number({ required_error: "Weight is required", invalid_type_error: "Weight must be a number" })
        .nonnegative("Weight cannot be negative")
        .int("Weight must be an integer")
        .max(100, "Weight cannot exceed 100"),
});

const TaintedGrailSchema = z.object({
    gameId: z.uuid().meta({ example: "550e8400-e29b-41d4-a716-446655440000" }),
    name: z.string()
        .min(2, "Name is too short")
        .max(50, "Name is too long")
        .regex(/^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s'-]+$/, "Name can only contain letters")
        .meta({ example: "Excalibur" }),
    slug: z.string()
        .min(2, "Slug is too short")
        .max(50, "Slug is too long")
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase, no spaces, only letters, numbers and hyphens")
        .meta({ example: "excalibur" }),
    assetType: z.enum(AssetTypeEnum, {
        error: "Asset type must be one of: Armor, Jewelry, Magic, Relic, Weapon",
    }).meta({ example: "Weapon" }),
    category: z.string().optional().meta({ example: "Onehanded" }),
    description: z.string({ error: "Description must be a string" })
        .meta({ example: "A legendary sword forged in Avalon" }),
    shortDescription: z.string({ error: "Short description must be a string" })
        .meta({ example: "Legendary sword" }),
    iconUrl: z.url("Icon URL must be a valid URL")
        .meta({ example: "https://example.com/excalibur.png" }),
    data: DataSchema,
    tags: z.array(TagEnumSchema)
        .min(1, "At least one tag is required")
        .meta({ example: ["melee", "one_handed", "arthurian"] }),
    isActive: z.boolean().meta({ example: true }),
}).superRefine((data, ctx) => {
    const validCategories = CategoryByAssetType[data.assetType];

    if (validCategories.length === 0) return;

    if (!data.category || !validCategories.includes(data.category)) {
        ctx.addIssue({
            code: z.core.$ZodIssueCode.custom,
            path: ["category"],
            message: `Category for ${data.assetType} must be one of: ${validCategories.join(", ")}`,
        });
    }
});