/**
 * Contains the base schema to validate game assets
 */

import { z } from 'zod';

// ─── Base Schema ──────────────────────────────────────────────────────────────
// Asset id, created_at and updated_at fields are automatically created on DB on INSERT

export const createBaseSchema = (gameSlug) =>
    z.object({
    name: z
        .string("name must be a string")
        .trim()
        .min(1, "name must be at least 1 character long")
        .max(100, "name cannot exceed 100 characters")
        .regex(/^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ0-9\s'+\-():&]+$/, "Name can only contain letters, numbers, spaces, &, :, +, -, ', and parentheses")
        .transform(val => val.charAt(0).toUpperCase() + val.slice(1), "First letter must be uppercase"),
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
        .optional()
})

// ─── Query & Params Validation ───────────────────────────────────────────────

export const assetQuerySchema = z.object({
    gameSlug: z
        .string('gameSlug is required')
        .trim()
        .min(1, 'gameSlug cannot be empty')
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'gameSlug must be lowercase alphanumeric with hyphens'),
    name: z
        .string()
        .trim()
        .min(1, 'name cannot be empty')
        .optional(),
    type: z
        .string()
        .trim()
        .min(1, 'type cannot be empty')
        .optional(),
    category: z
        .string()
        .trim()
        .min(1, 'category cannot be empty')
        .optional(),
    page: z.coerce
        .number()
        .int('page must be an integer')
        .min(1, 'page must be at least 1')
        .default(1),
    limit: z.coerce
        .number()
        .int('limit must be an integer')
        .min(1, 'limit must be at least 1')
        .max(50, 'limit cannot exceed 50')
        .default(15),
});

export const assetIdSchema = z.object({
    id: z.uuidv4('id must be a valid v4 uuid'),
});