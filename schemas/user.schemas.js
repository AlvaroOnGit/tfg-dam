/**
 * Contains the base schema to validate users
 */

import { z } from 'zod';

const userSchema = z.object({
    email: z
        .email("email must be a valid email address")
        .trim()
        .min(1, "email cannot be blank")
        .max(100, "email cannot exceed 100 characters"),
    username: z
        .string("username must be a string")
        .trim()
        .min(1, "username cannot be blank")
        .max(50, "username cannot exceed 50 characters")
        .regex(/^[a-zA-Z0-9_]+$/, "username can only contain letters, numbers and underscores"),
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

export default userSchema;