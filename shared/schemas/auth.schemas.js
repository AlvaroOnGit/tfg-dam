/**
 * Contains schemas to validate user credentials
 */

import { z } from 'zod';

// ─── Shared Schemas ────────────────────────────────────────────────────────────

const passwordSchema = z.string()
    .min(8, 'password must be at least 8 characters')
    .max(64, 'password must be at most 64 characters')
    .regex(/[A-Z]/, 'password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'password must contain at least one special character')

const emailSchema = z
    .email('email must be a valid email address')
    .trim()
    .min(1, 'email cannot be blank')
    .max(254, 'email cannot exceed 254 characters')
    .toLowerCase()

// ─── Login Schema ──────────────────────────────────────────────────────────────

export const loginSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    device: z.uuidv4('device must be a valid v4 uuid')
})

// ─── Register Schema ────────────────────────────────────────────────────────────

export const registerSchema = z.object({
    username: z
        .string('username must be a string')
        .trim()
        .min(3, 'username must be at least 3 characters')
        .max(20, 'username must be at most 20 characters')
        .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores and hyphens')
        .toLowerCase(),
    email: emailSchema,
    password: passwordSchema
})