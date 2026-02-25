/**
 * Contains schemas to validate assets for Elden Ring
 */

import {z} from 'zod';

// ─── Base Schema ──────────────────────────────────────────────────────────────

const BaseSchema = z.object({
    id: z.uuid({ error: "ID must be a valid UUID" }).optional()
        .meta({ example: "550e8400-e29b-41d4-a716-446655440000" }),
    gameId: z.uuid({ error: "Game ID must be a valid UUID" })
        .meta({ example: "550e8400-e29b-41d4-a716-446655440000" }),
    name: z.string({ error: (issue) => issue.input === undefined ? "Name is required" : "Name must be a string" })
        .min(2, "Name is too short")
        .max(50, "Name is too long")
        .regex(/^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ0-9\s'+\-]+$/, "Name can only contain letters, numbers and the + symbol")
        .meta({ example: "Excalibur" }),
    slug: z.string({ error: (issue) => issue.input === undefined ? "Slug is required" : "Slug must be a string" })
        .min(2, "Slug is too short")
        .max(50, "Slug is too long")
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase, no spaces, only letters, numbers and hyphens")
        .meta({ example: "excalibur" }),
    description: z.string({ error: (issue) => issue.input === undefined ? "Description is required" : "Description must be a string" })
        .meta({ example: "A legendary sword forged in Avalon" }),
    shortDescription: z.string({ error: (issue) => issue.input === undefined ? "Short description is required" : "Short description must be a string" })
        .meta({ example: "Legendary sword" }),
    iconUrl: z.url("Icon URL must be a valid URL")
        .meta({ example: "https://example.com/excalibur.png" }),
    tags: z.array(TagEnumSchema)
        .min(1, "At least one tag is required")
        .meta({ example: ["melee", "one_handed", "arthurian"] }),
    isActive: z.boolean({ error: (issue) => issue.input === undefined ? "Is active is required" : "Is active must be a boolean" })
        .meta({ example: true }),
    createdAt: z.iso.datetime({ error: "Created at must be a valid datetime" }).optional()
        .meta({ example: "2024-01-01T00:00:00.000Z" }),
    updatedAt: z.iso.datetime({ error: "Updated at must be a valid datetime" }).optional()
        .meta({ example: "2024-01-01T00:00:00.000Z" }),
});

export default BaseSchema;