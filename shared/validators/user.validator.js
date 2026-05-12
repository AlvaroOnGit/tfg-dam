/**
 * Contains logic to validate users
 */

import { userParamsSchema, userUpdateSchema } from '../schemas/user.schemas.js';
import userSchema from '../schemas/user.schemas.js';

/**
 * Validates a user using the user schema.
 *
 * @function validateUser
 * @param {Object} data - User data to validate.
 * @returns {import("zod").SafeParseReturnType<any, any> | { success: false, error: string }}
 * returns the Zod validation result.
 */
export function validateUser (data) {
    return userSchema.safeParse(data);
}

/**
 * Validates the body of a request when updating a user profile
 *
 * @param {Object} data - Route params to validate
 * @returns {import("zod").SafeParseReturnType<any, any>}
 */
export function validateUserUpdate(data) {
    return userUpdateSchema.partial().safeParse(data);
}

/**
 * Validates params for user routes
 * Checks that the id is a valid UUID
 *
 * @param {Object} data - Route params to validate
 * @returns {import("zod").SafeParseReturnType<any, any>}
 */
export function validateUserParams(data) {
    return userParamsSchema.safeParse(data);
}