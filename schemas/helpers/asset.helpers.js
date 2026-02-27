/**
 * Contains helpers to validate assets for games
 */
/**
 * Helper to validate that an asset's iconUrl matches a predefined file path.
 *
 * The expected path format is:
 *   /media/games/{gameSlug}/assets/{slug}-{type}-{gameSlug}.webp
 *
 * Requirements:
 * - The object must have `slug`, `type`, `gameSlug` and `iconUrl` fields.
 * - This is intended to be used in Zod's `superRefine` for runtime validation.
 *
 * @param obj - The object containing the asset fields.
 * @param ctx - Zod refinement context used to report validation issues.
 */

export const validateIconUrl = (obj, ctx) => {
    const { slug, type, gameSlug, iconUrl } = obj;
    const expectedPath = `/media/games/${gameSlug}/assets/${slug}-${type}-${gameSlug}.webp`;
    if (iconUrl !== expectedPath) {
        ctx.addIssue({
            code: "custom",
            received: iconUrl,
            message: `iconUrl must be exactly: ${expectedPath}`,
            path: ["iconUrl"]
        })
    }
};