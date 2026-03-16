/**
 * Contains the schema to validate games
 */
import { z } from 'zod';
import { validateGameMedia } from "./helpers/media.helpers.js";

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

export default gameSchema;