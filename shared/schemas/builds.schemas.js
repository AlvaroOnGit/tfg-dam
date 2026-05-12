/**
 * Contains the base schema to validate game builds
 */

import { z } from 'zod';

// ─── Base Build Schema ─────────────────────────────────────────────────────

const createBaseBuildSchema = (gameSlug) =>
    z.object({
        gameSlug: z.literal(gameSlug),
        name: z
            .string("name must be a string")
            .trim()
            .min(1, "name must be at least 1 character long")
            .max(100, "name cannot exceed 100 characters"),
        description: z
            .string("description must be a string")
            .trim()
            .min(1, "description must be at least 1 character long")
            .optional()
            .nullable()
            .default(null),
        isPublic: z
            .boolean("isPublic must be a boolean")
            .default(false),
        isPublished: z
            .boolean("isPublished must be a boolean")
            .default(true),
        version: z
            .string("version must be a string")
            .trim()
            .regex(/^\d+\.\d+(\.\d+)?$/, "version must follow semver format: 1.0 or 1.0.0")
            .optional()
            .nullable()
            .default(null),
        gameVersion: z
            .string("gameVersion must be a string")
            .trim()
            .regex(/^\d+\.\d+(\.\d+)?$/, "gameVersion must follow semver format: 1.0 or 1.0.0")
            .optional()
            .nullable()
            .default(null),
    });

// ─── Query & Param Validation ────────────────────────────────────────────

export const buildQuerySchema = z.object({
        gameSlug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'gameSlug must be a valid slug').optional(),
        name:     z.string().optional(),
        tags:     z.union([z.string(), z.array(z.string())]).optional(),
        creator:  z.uuid().optional(),
        page:     z.coerce.number().int().min(1).optional().default(1),
        limit:    z.coerce.number().int().min(1).max(100).optional().default(15),
});

export const buildParamsSchema = z.object({
        id: z.uuidv4(),
        userId: z.uuidv4()
});

export default createBaseBuildSchema;