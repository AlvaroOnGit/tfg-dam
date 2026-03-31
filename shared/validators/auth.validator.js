/**
 * Contains logic to validate user credentials
 */

import { partialAuthSchema, loginSchema, registerSchema } from "../schemas/auth.schemas.js";

/**
 * Validates the authentication of a user
 *
 * All fields are optional and support partial validation
 * use cases where one or more parameters may be absent.
 *
 * @function validateEmail
 * @param {Object} data - Auth data to validate.
 * @returns {import("zod").SafeParseReturnType<any, any> | { success: false, error: string }}
 * returns the Zod validation result.
 */
export function validatePartialAuth(data) {
    return partialAuthSchema.safeParse(data)
}

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