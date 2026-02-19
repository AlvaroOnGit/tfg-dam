/**
 * Contains schemas to validate assets for Elden Ring
 */
import { z } from 'zod';

// Esquema para Armas
const WeaponSchema = z.object({
  name: z.string().nonempty().example("Espada de la luz"),
  type: z.enum(["espada", "hacha", "lanza", "arco"]).example("espada"),
  damage: z.number().min(1).max(1000).example(50),
  scaling: z.enum(["D", "C", "B", "A", "S"]).example("B"),
});

// Esquema para Armaduras
const ArmorSchema = z.object({
  name: z.string().nonempty().example("Armadura de caballero"),
  defense: z.number().min(1).max(1000).example(150),
  type: z.enum(["cabeza", "torso", "pierna"]).example("torso"),
});

// Esquema para Talismanes
const TalismanSchema = z.object({
  name: z.string().nonempty().example("Talismán de resistencia"),
  effect: z.string().nonempty().example("Aumenta la resistencia al fuego"),
});

// Esquema para Cenizas de guerra
const AshOfWarSchema = z.object({
  name: z.string().nonempty().example("Ceniza de guerra de ataque"),
  power: z.number().min(1).max(100).example(20),
});

// Esquema para Cenizas espirituales
const SpiritAshSchema = z.object({
  name: z.string().nonempty().example("Ceniza espiritual de lobo"),
  summonCost: z.number().min(1).max(100).example(10),
});

// Exportar los esquemas
export {
  WeaponSchema,
  ArmorSchema,
  TalismanSchema,
  AshOfWarSchema,
  SpiritAshSchema,
};


