/**
 * Contains the base schema to validate users
 */

import { z } from 'zod';

// ─── Shared Schemas ─────────────────────────────────────────────────────

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

const usernameSchema = z
    .string('username must be a string')
    .trim()
    .min(3, 'username must be at least 3 characters')
    .max(20, 'username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores and hyphens')
    .toLowerCase()

// ─── Base User Schema ───────────────────────────────────────────────────

const userSchema = z.object({
    email: emailSchema,
    username: usernameSchema,
    passwordHash: z
        .string()
        .startsWith("$argon2", "password must be an argon2 encrypted password"),
    role: z
        .enum(['user', 'admin'])
        .default('user'),
    roleLevel: z
        .enum(['normal', 'super'])
        .default('normal'),
    avatar: z
        .url("avatar must be a valid URL")
        .nullable()
        .default(null),
    state: z
        .enum(['active', 'banned', 'restricted'])
        .default('active'),
    isVerified: z
        .boolean("isVerified must be a boolean")
        .default(false),
});

// ─── Profile Update Validation ───────────────────────────────────────────

export const userUpdateSchema = z.object({
    email: emailSchema,
    username: usernameSchema,
    password: passwordSchema,
    newPassword: passwordSchema,
})

// ─── Query & Param Validation ────────────────────────────────────────────

export const userParamsSchema = z.object({
    id: z.uuidv4(),
});

export default userSchema;