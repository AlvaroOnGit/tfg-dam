/**
 * Contains helpers to validate asset slots for builds
 */

/**
 * Helper to validate that an asset's slotName is valid for its slotCategory.
 *
 * Requirements:
 * - The object must have `slotCategory` and `slotName` fields.
 * - `slotNamesByCategory` must be a map of category -> valid slot names.
 * - This is intended to be used in Zod's `superRefine` for runtime validation.
 *
 * @param slotNamesByCategory - Object mapping each category to its valid slot names.
 * @returns A Zod superRefine callback that validates the slotName against the category.
 */
export const validateSlotName = (slotNamesByCategory) => (data, ctx) => {
    const validNames = slotNamesByCategory[data.slotCategory];
    if (!validNames.includes(data.slotName)) {
        ctx.addIssue({
            code: "invalid_value",
            received: data.slotName,
            options: validNames,
            path: ["slotName"],
            message: `slotName '${data.slotName}' is not valid for category '${data.slotCategory}'`
        });
    }
};

/**
 * Helper to validate that a build's assets have no duplicate slotNames.
 *
 * Requirements:
 * - The object must have an `assets` array where each element has a `slotName` field.
 * - This is intended to be used in Zod's `superRefine` for runtime validation.
 *
 * @param data - The object containing the assets array.
 * @param ctx - Zod refinement context used to report validation issues.
 */
export const validateNoDuplicateSlots = (data, ctx) => {
    const slotNames = data.assets.map(a => a.slotName);
    const duplicates = slotNames.filter((name, index) => slotNames.indexOf(name) !== index);

    if (duplicates.length > 0) {
        ctx.addIssue({
            code: "invalid_value",
            path: ["assets"],
            message: `Duplicate slotNames found: ${duplicates.join(", ")}`
        });
    }
};