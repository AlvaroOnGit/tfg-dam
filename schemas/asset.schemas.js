/**
 * Contains the base schema to validate game assets
 */

import { z } from 'zod';

// ─── Base Schema ──────────────────────────────────────────────────────────────
// Asset id, created_at and updated_at fields are automatically created on DB on INSERT

const createBaseSchema = (gameSlug) =>
    z.object({
    name: z
        .string("name must be a string")
        .trim()
        .min(1, "name must be at least 1 character long")
        .max(100, "name cannot exceed 100 characters")
        .regex(/^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ0-9\s'+\-]+$/, "Name can only contain letters, numbers and the + symbol"),
    slug: z
        .string("slug must be a string")
        .trim()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be lowercase letters, numbers and single dashes only")
        .min(1, "Slug must be at least 1 character long"),
    gameSlug: z.literal(gameSlug),
    description: z
        .string("description must be a string")
        .trim()
        .min(1, "description must be at least 1 character long")
        .nullable(),
    shortDescription: z
        .string("description must be a string")
        .trim()
        .min(1, "short description must be at least 1 character long")
        .max(250, "short description cannot exceed 250 characters")
        .nullable(),
    iconUrl: z.
        string()
        .regex(
            new RegExp(`^/media/games/${gameSlug}/assets/[a-zA-Z0-9\\-_]+\\.webp$`, "i"),
            `iconUrl must be under /media/games/${gameSlug}/assets/*.webp`
        ),
    isActive: z
        .boolean("value must be a boolean")
        .default(true)
})

export default createBaseSchema;