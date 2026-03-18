/**
 * Contains logic to validate user credentials
 */

import { loginSchema, registerSchema } from "../schemas/auth.schemas.js";

/**
 * Validates the login credentials for a user
 *
 * @function validateLogin
 * @param {Object} data - Login data to validate.
 * @returns {import("zod").SafeParseReturnType<any, any> | { success: false, error: string }}
 * returns the Zod validation result.
 */
export function validateLogin(data) {
    return loginSchema.safeParse(data);
}

/**
 * Validates the register credentials for a user
 *
 * @function validateRegister
 * @param {Object} data - Registration data to validate.
 * @returns {import("zod").SafeParseReturnType<any, any> | { success: false, error: string }}
 * returns the Zod validation result.
 */
export function validateRegister(data) {
    return registerSchema.safeParse(data);
}