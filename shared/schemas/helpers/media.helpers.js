/**
 * Contains helpers to validate media urls for games
 */
/**
 * Helper to validate that an asset's iconUrl matches a predefined file path.
 *
 * The expected path format is:
 *   /media/games/{gameSlug}/assets/{type}-{slug}-{gameSlug}.webp
 *
 * Requirements:
 * - The object must have `slug`, `type`, `gameSlug` and `iconUrl` fields.
 * - This is intended to be used in Zod's `superRefine` for runtime validation.
 *
 * @param obj - The object containing the asset fields.
 * @param ctx - Zod refinement context used to report validation issues.
 */
export const validateAssetMedia = (obj, ctx) => {
    const { slug, type, gameSlug, iconUrl } = obj;
    const expectedPath = `/media/games/${gameSlug}/assets/${type}-${slug}-${gameSlug}.webp`;
    if (iconUrl !== expectedPath) {
        ctx.addIssue({
            code: "custom",
            received: iconUrl,
            message: `iconUrl must be exactly: ${expectedPath}`,
            path: ["iconUrl"]
        })
    }
};

/**
 * Helper to validate that a game's iconUrl and coverUrl matches a predefined file path.
 *
 * The expected path format is:
 *   - /media/games/${slug}/graphics/${slug}-cover.webp
 *   - /media/games/${slug}/graphics/${slug}-icon.webp
 *
 * Requirements:
 * - The object must have `slug`, `iconUrl` and `coverUrl` fields.
 * - This is intended to be used in Zod's `superRefine` for runtime validation.
 *
 * @param obj - The object containing the game fields.
 * @param ctx - Zod refinement context used to report validation issues.
 */
export const validateGameMedia = (obj, ctx) => {
    const { slug, coverUrl, iconUrl } = obj;
    const expectedCoverPath = `/media/games/${slug}/graphics/${slug}-cover.webp`;
    const expectedIconPath = `/media/games/${slug}/graphics/${slug}-icon.webp`;
    if (coverUrl !== expectedCoverPath) {
        ctx.addIssue({
            code: "custom",
            received: coverUrl,
            message: `coverUrl must be exactly: ${expectedCoverPath}`,
            path: ["coverUrl"]
        })
    }
    if (iconUrl !== expectedIconPath) {
        ctx.addIssue({
            code: "custom",
            received: iconUrl,
            message: `iconUrl must be exactly: ${expectedIconPath}`,
            path: ["iconUrl"]
        })
    }
};