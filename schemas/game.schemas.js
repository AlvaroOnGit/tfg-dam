/**
 * Master schema for games
 * Usable in: seeds, tests, endpoints
 */

import { z } from 'zod';

// -----------------------------------------------
// Base fields — reusable primitives
// -----------------------------------------------

const nameField = z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(1, 'Name cannot be blank')
    .max(100, 'Name cannot exceed 100 characters');

const slugField = z
    .string({ required_error: 'Slug is required' })
    .trim()
    .min(1, 'Slug cannot be blank')
    .max(100, 'Slug cannot exceed 100 characters')
    .regex(
        /^[a-z0-9]+(-[a-z0-9]+)*$/,
        'Slug must be lowercase alphanumeric words separated by hyphens (e.g. "my-game")'
    );

const descriptionField = z
    .string({ required_error: 'Description is required' })
    .trim()
    .min(1, 'Description cannot be blank');

const genresField = z
    .array(
        z.string().trim().min(1, 'Each genre must be a non-blank string'),
        { required_error: 'Genres are required' }
    )
    .min(1, 'At least one genre is required');

const isActiveField = z
    .boolean({ required_error: 'isActive is required' });

// -----------------------------------------------
// URL field factory
// Validates that an image URL matches the expected
// path pattern for a given game slug.
//
// Expected patterns:
//   coverUrl → public/media/games/{slug}/graphics/{slug}-cover.webp
//   iconUrl  → public/media/games/{slug}/graphics/{slug}-icon.webp
// -----------------------------------------------

function makeGameImageUrlField(imageType) {
    if (imageType !== 'cover' && imageType !== 'icon') {
        throw new Error(`makeGameImageUrlField: unsupported imageType "${imageType}"`);
    }

    return (slug) => {
        const expected = `public/media/games/${slug}/graphics/${slug}-${imageType}.webp`;

        return z
            .string({ required_error: `${imageType}Url is required` })
            .trim()
            .min(1, `${imageType}Url cannot be blank`)
            .refine(
                (val) => val === expected,
                {
                    message: `${imageType}Url must be "${expected}"`,
                }
            );
    };
}

// -----------------------------------------------
// Full game schema (requires slug to validate URLs)
// Use this when the slug is already known.
//
// Example:
//   GameSchema('elden-ring').parse({ name: 'Elden Ring', slug: 'elden-ring', ... })
// -----------------------------------------------

export function GameSchema(slug) {
    return z.object({
        name:        nameField,
        slug:        slugField,
        description: descriptionField,
        genres:      genresField,
        coverUrl:    makeGameImageUrlField('cover')(slug),
        iconUrl:     makeGameImageUrlField('icon')(slug),
        isActive:    isActiveField,
    });
}

// -----------------------------------------------
// Partial schemas — for specific contexts
// -----------------------------------------------

/** Validates only the core identity fields (name, slug, description, genres) */
export const GameCoreSchema = z.object({
    name:        nameField,
    slug:        slugField,
    description: descriptionField,
    genres:      genresField,
});

/** Validates only the status field */
export const GameStatusSchema = z.object({
    isActive: isActiveField,
});

// -----------------------------------------------
// Update schema — all fields optional
// Use for PATCH endpoints or partial updates
// -----------------------------------------------

export const GameUpdateSchema = z.object({
    name:        nameField.optional(),
    slug:        slugField.optional(),
    description: descriptionField.optional(),
    genres:      genresField.optional(),
    coverUrl:    z.string().trim().min(1, 'coverUrl cannot be blank').optional(),
    iconUrl:     z.string().trim().min(1, 'iconUrl cannot be blank').optional(),
    isActive:    isActiveField.optional(),
});