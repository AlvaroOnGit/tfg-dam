/**
 * Contains schemas to validate assets for Elden Ring
 */
import { regex, z } from 'zod';
import BaseSchema from './asset-base.schema.js';

//data schemas//
//schemas for weapon data//

const weaponDataSchema = z.object({
  attack: weaponattackDataSchema,
  guard: weaponguardDataSchema,
  scaling: weaponscalingDataSchema,
  requires: weaponrequiresDataSchema,
  weight: weightDataSchema
});

const weaponattackDataSchema = z.object({
  physical: z.number({ error: "Physical attack must be a number" }).nonnegative("Physical attack cannot be negative").integer("Physical attack must be an integer"),
  magical: z.number({ error: "Magical attack must be a number" }).nonnegative("Magical attack cannot be negative").integer("Magical attack must be an integer"),
  fire: z.number({ error: "Fire attack must be a number" }).nonnegative("Fire attack cannot be negative").integer("Fire attack must be an integer"),
  lightning: z.number({ error: "Lightning attack must be a number" }).nonnegative("Lightning attack cannot be negative").integer("Lightning attack must be an integer"),
  holy: z.number({ error: "Holy attack must be a number" }).nonnegative("Holy attack cannot be negative").integer("Holy attack must be an integer"),
  critical: z.number({ error: "Critical attack must be a number" }).nonnegative("Critical attack cannot be negative").integer("Critical attack must be an integer")
});

const weaponguardDataSchema = z.object({
  physical: z.number({ error: "Physical guard must be a number" }).nonnegative("Physical guard cannot be negative").integer("Physical guard must be an integer"),
  magical: z.number({ error: "Magical guard must be a number" }).nonnegative("Magical guard cannot be negative").integer("Magical guard must be an integer"),
  fire: z.number({ error: "Fire guard must be a number" }).nonnegative("Fire guard cannot be negative").integer("Fire guard must be an integer"),
  lightning: z.number({ error: "Lightning guard must be a number" }).nonnegative("Lightning guard cannot be negative").integer("Lightning guard must be an integer"),
  holy: z.number({ error: "Holy guard must be a number" }).nonnegative("Holy guard cannot be negative").integer("Holy guard must be an integer"),
  boost: z.number({ error: "Guard boost must be a number" }).nonnegative("Guard boost cannot be negative").integer("Guard boost must be an integer")
});

const weaponscalingDataSchema = z.object({
  strength: z.enum(["S", "A", "B", "C", "D", "E", "None"], { error: "Strength scaling must be one of S, A, B, C, D, E or None" }),
  dexterity: z.enum(["S", "A", "B", "C", "D", "E", "None"], { error: "Dexterity scaling must be one of S, A, B, C, D, E or None" }),
  intelligence: z.enum(["S", "A", "B", "C", "D", "E", "None"], { error: "Intelligence scaling must be one of S, A, B, C, D, E or None" }),
  faith: z.enum(["S", "A", "B", "C", "D", "E", "None"], { error: "Faith scaling must be one of S, A, B, C, D, E or None" })
});

const weaponrequiresDataSchema = z.object({
  strength: z.number({ error: "Strength requirement must be a number" }).nonnegative("Strength requirement cannot be negative").integer("Strength requirement must be an integer"),
  dexterity: z.number({ error: "Dexterity requirement must be a number" }).nonnegative("Dexterity requirement cannot be negative").integer("Dexterity requirement must be an integer"), 
  intelligence: z.number({ error: "Intelligence requirement must be a number" }).nonnegative("Intelligence requirement cannot be negative").integer("Intelligence requirement must be an integer"),
  faith: z.number({ error: "Faith requirement must be a number" }).nonnegative("Faith requirement cannot be negative").integer("Faith requirement must be an integer")
});

//schemas for armor data//
const armorDataSchema = z.object({
  dmg_negation: armorDmgNegationDataSchema,
  resistances: armorResistancesDataSchema,
  weight: weightDataSchema
});

const armorDmgNegationDataSchema = z.object({
  physical: z.number({ error: "Physical damage negation must be a number" }).nonnegative("Physical damage negation cannot be negative"),
  vs_strike: z.number({ error: "Strike damage negation must be a number" }).nonnegative("Strike damage negation cannot be negative"),
  vs_slash: z.number({ error: "Slash damage negation must be a number" }).nonnegative("Slash damage negation cannot be negative"),
  vs_pierce: z.number({ error: "Pierce damage negation must be a number" }).nonnegative("Pierce damage negation cannot be negative"),
  magical: z.number({ error: "Magical damage negation must be a number" }).nonnegative("Magical damage negation cannot be negative"),
  fire: z.number({ error: "Fire damage negation must be a number" }).nonnegative("Fire damage negation cannot be negative"),
  lightning: z.number({ error: "Lightning damage negation must be a number" }).nonnegative("Lightning damage negation cannot be negative"),
  holy: z.number({ error: "Holy damage negation must be a number" }).nonnegative("Holy damage negation cannot be negative")
});

const armorResistancesDataSchema = z.object({
  immunity: z.number({ error: "Immunity resistance must be a number" }).nonnegative("Immunity resistance cannot be negative").integer("Immunity resistance must be an integer"),
  robustness: z.number({ error: "Robustness resistance must be a number" }).nonnegative("Robustness resistance cannot be negative").integer("Robustness resistance must be an integer"),
  focus: z.number({ error: "Focus resistance must be a number" }).nonnegative("Focus resistance cannot be negative").integer("Focus resistance must be an integer"),
  vitality: z.number({ error: "Vitality resistance must be a number" }).nonnegative("Vitality resistance cannot be negative").integer("Vitality resistance must be an integer"),
  poise: z.number({ error: "Poise resistance must be a number" }).nonnegative("Poise resistance cannot be negative").integer("Poise resistance must be an integer")
});

//schemas for talisman data//
const talismanDataSchema = z.object({
  effect: z.string({ error: (issue) => issue.input === undefined ? "Effect is required" : "Effect must be a string" })
    .meta({ example: "Increases maximum HP by 6%." }),
  weight: weightDataSchema
});

const talismanEffectDataSchema = z.object({
  effect: z.string({ error: (issue) => issue.input === undefined ? "Effect is required" : "Effect must be a string" })
    .meta({ example: "Increases maximum HP by 6%." })
});

//schemas for ash of war data//
const ashOfWarDataSchema = z.object({
  skill: z.string({ error: (issue) => issue.input === undefined ? "Skill is required" : "Skill must be a string" })
    .meta({ example: "Dryleaf Whirlwind" })
});

//schemas for spirit ash data//
const spiritAshDataSchema = z.object({
  FP_cost: z.number({ error: "FP cost must be a number" }).nonnegative("FP cost cannot be negative").integer("FP cost must be an integer"),
  HP_cost: z.number({ error: "HP cost must be a number" }).nonnegative("HP cost cannot be negative").integer("HP cost must be an integer").nullable()
});

//schema for weight data//
const weightDataSchema = z.object({
  weight: z.number({ error: "Weight must be a number" }).nonnegative("Weight cannot be negative")
});


//defining category enums//
const weaponCategories = z.enum([ 
  "dagger", 
  "straight_swords", 
  "greatswords", 
  "colossal_swords", 
  "thrusting_swords", 
  "heavy_thrusting_swords",
  "curved_swords", 
  "curved_greatswords", 
  "katanas", 
  "twinblades", 
  "flails", 
  "axes", 
  "great_axes", 
  "colossal_weapons", 
  "hammers", 
  "great_hammers", 
  "spears", 
  "greatspears",
  "claws", 
  "halberds", 
  "reapers", 
  "whips", 
  "flails", 
  "fists", 
  "light_bows", 
  "bows",
  "greatbows", 
  "crossbows", 
  "ballistas", 
  "glintstone_staffs",
  "sacred_seals", 
  "torchs", 
  "thrusting_shields", 
  "tools", 
  "hand-to-hand_arts", 
  "throwing_blades", 
  "backhand_blades", 
  "perfume_bottles", 
  "beast_claws", 
  "light_greatswords", 
  "great_katanas"

]);

const armorCategories = z.enum([
  "helmets", 
  "chest_armor",  
  "gauntlets", 
  "legs"
]);

//main schema//
const EldenRingSchema = z.discriminatedUnion("assetType", [

  BaseSchema.extend({
    assetType: z.literal("weapon"),
    category: weaponCategories,
    data: weaponDataSchema
  }),

  BaseSchema.extend({
    assetType: z.literal("armor"),
    category: armorCategories,
    data: armorDataSchema
  }),

  BaseSchema.extend({
    assetType: z.literal("talisman"),
    category: z.literal("talismans"),
    data: talismanDataSchema
  }),

  BaseSchema.extend({
    assetType: z.literal("ash_of_war"),
    category: z.literal("ashes_of_war"),
    data: ashOfWarDataSchema
  }),

  BaseSchema.extend({
    assetType: z.literal("spirit_ash"),
    category: z.literal("spirit_ashes"),
    data: spiritAshDataSchema
  })

])

export default EldenRingSchema;
