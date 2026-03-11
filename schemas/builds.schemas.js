import { z } from 'zod';

const createBaseBuildSchema = (gameSlug) =>
    z.object({
        gameSlug: z.literal(gameSlug),
        creatorId: z.uuid("creatorId must be a valid UUID"),
        name: z
            .string("name must be a string")
            .trim()
            .min(1, "name must be at least 1 character long")
            .max(100, "name cannot exceed 100 characters"),
        description: z
            .string("description must be a string")
            .trim()
            .min(1, "description must be at least 1 character long"),
        isPublic: z
            .boolean("isPublic must be a boolean")
            .default(false),
        isPublished: z
            .boolean("isPublished must be a boolean")
            .default(false),
        version: z
            .string("version must be a string")
            .trim()
            .regex(/^\d+\.\d+(\.\d+)?$/, "version must follow semver format: 1.0 or 1.0.0")
            .nullable(),
        gameVersion: z
            .string("gameVersion must be a string")
            .trim()
            .regex(/^\d+\.\d+(\.\d+)?$/, "gameVersion must follow semver format: 1.0 or 1.0.0")
            .nullable(),
    });

export default createBaseBuildSchema;