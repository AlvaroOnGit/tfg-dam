
import { z } from 'zod';

const userSchemas = z.object({
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

    password: z
        .string("password must be a string")
        .min(8, "password must be at least 8 characters")
        .max(50, "password cannot exceed 255 characters"),

    role: z
        .enum(['user', 'admin'], "role must be 'user' or 'admin'")
        .default('user'),

    role_level: z
        .enum(['normal', 'super'], "role_level must be 'normal' or 'super'")
        .default('normal'),

    avatar: z
        .url("avatar must be a valid URL")
        .nullable()
        .default(null),

    state: z
        .enum(['active', 'banned', 'restricted'], "state must be 'active', 'banned' or 'restricted'")
        .default('active'),

    is_verified: z
        .boolean("is_verified must be a boolean")
        .default(false),
});

export default userSchemas;