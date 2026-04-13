/**
 * Express middleware to validate and transform request data
 */
import { ValidationError } from "./error.middleware.js";

/**
 * Validates and transforms request data using a validator function.
 * On success, overwrites the request source with validated data.
 * On failure, throws a ValidationError.
 *
 * @param {Function} validator - Validator function that must have a success property and flatten() method.
 * @param {('body'|'params'|'query')} [source='body'] - The request property to validate.
 * @returns {import('express').RequestHandler} Express middleware function.
 *
 * @example
 * router.post('/', validate(validationFunction), ...);
 */
export const validationHandler = (validator, source = 'body') => {
    return (req, res, next) => {

        const result = validator(req[source]);

        if (!result.success) {
            const errors = result.error.flatten().fieldErrors;
            throw new ValidationError('Error validating the request body', errors);
        }

        if (source === 'query') {
            req.validatedQuery = result.data;
        } else {
            req[source] = result.data;
        }
        next();
    }
}