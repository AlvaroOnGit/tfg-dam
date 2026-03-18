/**
 * Contains logic to validate users
 */

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