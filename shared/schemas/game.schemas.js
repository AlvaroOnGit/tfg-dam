/**
 * Contains the schema to validate games
 */
import { z } from 'zod';
import { validateGameMedia } from "./helpers/media.helpers.js";

// ─── Base Game Schema ─────────────────────────────────────────────────────

const gameSchema = z.object({
    slug: z
        .string("slug must be a valid string")
        .trim()
        .min(1, "slug cannot be blank")
        .max(100, "slug cannot exceed 100 characters")
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be lowercase alphanumeric with hyphens"),
    name: z
        .string("name must be a string")
        .trim()
        .min(1, "name cannot be blank")
        .max(100, "name cannot exceed 100 characters"),
    description: z
        .string("description must be a string")
        .trim()
        .min(1, "description cannot be blank")
        .max(500, "description cannot exceed 500 characters"),
    genres: z
        .array(z.string().trim().min(1, "genre cannot be blank"))
        .min(1, "genres cannot be empty")
        .max(10, "genres cannot exceed 10 items")
        .refine(val => new Set(val).size === val.length, "genres cannot contain duplicates"),
    coverUrl: z.string(),
    iconUrl: z.string(),
    isActive: z
        .boolean('isActive must be a boolean')
        .default(false),
}).superRefine(validateGameMedia);

// ─── Query & Param Validation ────────────────────────────────────────────

export const gameQuerySchema = z.object({
    name:     z.string().optional(),
    genres:   z.union([z.string(), z.array(z.string())]).optional(),
    page:     z.coerce.number().int().min(1).optional().default(1),
    limit:    z.coerce.number().int().min(1).max(100).optional().default(15),
});

export const gameParamsSchema = z.object({
    slug: z
        .string("slug must be a valid string")
        .trim()
        .min(1, "slug cannot be blank")
        .max(100, "slug cannot exceed 100 characters")
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be lowercase alphanumeric with hyphens"),
});

export default gameSchema;