/**
 * Contains schemas to validate assets for Elden Ring
 */
import { z } from 'zod';

// ------------------------
// WeaponSchema (Armas)
// ------------------------
const WeaponSchema = z.object({
  name: z.string({
    required_error: "El nombre del arma es obligatorio",
    invalid_type_error: "El nombre del arma debe ser texto"
  }).min(1, "El nombre no puede estar vacío").example("Espada de la luz"),

  type: z.enum(["espada", "hacha", "lanza", "arco"], {
    errorMap: () => ({
      message: "Tipo de arma inválido"
    })
  }).example("espada"),

  damage: z.number({
    required_error: "El daño es obligatorio",
    invalid_type_error: "El daño debe ser un número"
  })
  .min(1, "El daño mínimo es 1")
  .max(1000, "El daño máximo es 1000")
  .example(50),

  scaling: z.enum(["D", "C", "B", "A", "S"], {
    errorMap: () => ({
      message: "Scaling inválido (D, C, B, A o S)"
    })
  }).example("B"),
});

// ------------------------
// ArmorSchema (Armaduras)
// ------------------------
const ArmorSchema = z.object({
  name: z.string({
    required_error: "El nombre de la armadura es obligatorio",
    invalid_type_error: "El nombre de la armadura debe ser texto"
  }).min(1, "El nombre no puede estar vacío").example("Armadura de caballero"),

  defense: z.number({
    required_error: "La defensa es obligatoria",
    invalid_type_error: "La defensa debe ser un número"
  })
  .min(1, "La defensa mínima es 1")
  .max(1000, "La defensa máxima es 1000")
  .example(150),

  type: z.enum(["cabeza", "torso", "pierna"], {
    errorMap: () => ({
      message: "El tipo debe ser: cabeza, torso o pierna"
    })
  }).example("torso"),
});

// ------------------------
// TalismanSchema (Talismanes)
// ------------------------
const TalismanSchema = z.object({
  name: z.string({
    required_error: "El nombre del talismán es obligatorio",
    invalid_type_error: "El nombre del talismán debe ser texto"
  }).min(1, "El nombre no puede estar vacío").example("Talismán de resistencia"),

  effect: z.string({
    required_error: "El efecto es obligatorio",
    invalid_type_error: "El efecto debe ser texto"
  }).min(1, "El efecto no puede estar vacío").example("Aumenta la resistencia al fuego"),
});

// ------------------------
// AshOfWarSchema (Cenizas de guerra)
// ------------------------
const AshOfWarSchema = z.object({
  name: z.string({
    required_error: "El nombre de la ceniza de guerra es obligatorio",
    invalid_type_error: "El nombre debe ser texto"
  }).min(1, "El nombre no puede estar vacío").example("Ceniza de guerra de ataque"),

  power: z.number({
    required_error: "El poder es obligatorio",
    invalid_type_error: "El poder debe ser un número"
  })
  .min(1, "El poder mínimo es 1")
  .max(100, "El poder máximo es 100")
  .example(20),
});

// ------------------------
// SpiritAshSchema (Cenizas espirituales)
// ------------------------
const SpiritAshSchema = z.object({
  name: z.string({
    required_error: "El nombre de la ceniza espiritual es obligatorio",
    invalid_type_error: "El nombre debe ser texto"
  }).min(1, "El nombre no puede estar vacío").example("Ceniza espiritual de lobo"),

  summonCost: z.number({
    required_error: "El coste de invocación es obligatorio",
    invalid_type_error: "El coste de invocación debe ser un número"
  })
  .min(1, "El coste mínimo es 1")
  .max(100, "El coste máximo es 100")
  .example(10),
});

// ------------------------
// Exportar todos los esquemas
// ------------------------
export {
  WeaponSchema,
  ArmorSchema,
  TalismanSchema,
  AshOfWarSchema,
  SpiritAshSchema,
};

