import { InternalError } from "./error.middleware.js";

/**
 * Express middleware factory that resolves all UUID references in a build
 * (both equipped asset slots and templateData) into full asset objects from the DB.
 *
 * Expects `req.build` to be set by a previous middleware.
 * Responds with the resolved build as JSON.
 *
 * @param {object} assetModel - Asset model instance with a `fetchAssets` method.
 * @throws {InternalError} If the asset parsing fails.
 *
 * @example
 * buildRouter.get('/:id',
 *     validationHandler(validateBuildParams, 'params'),
 *     buildController.getBuildById,
 *     buildParser(AssetModel),
 * );
 */
export const buildParser = (assetModel) => async (req, res, next) => {
    if (!req.build) next();

    try {
        const { assets = [], templateData = {} } = req.build;

        const uuids = extractUUIDs(templateData);
        for (const a of assets) {
            if (a?.assetId) uuids.add(a.assetId);
        }

        const assetMap = uuids.size
            ? await assetModel.fetchAssets([...uuids])
            : new Map();

        const build = {
            ...req.build,
            assets: assets.map(a => ({
                ...(assetMap.get(a.assetId) ?? {}),
                slotCategory: a.slotCategory,
                slotName: a.slotName,
            })),
            templateData: resolveUUIDs(templateData, assetMap),
        };

        res.status(200).json(build);
    } catch (e) {
        next(new InternalError('Failed to parse build assets', e));
    }
};

const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isUUID = (val) => typeof val === 'string' && UUID_REGEX.test(val);

/**
 * Recursively extracts all UUIDs from any nested structure (objects, arrays, strings).
 * @param {*} val - Value to walk through.
 * @param {Set<string>} [collected=new Set()] - Accumulator set for found UUIDs.
 * @returns {Set<string>} Set of unique UUIDs found.
 *
 * @example
 * extractUUIDs({ weapon: "uuid-1", spells: ["uuid-2", "uuid-3"] })
 * // → Set { "uuid-1", "uuid-2", "uuid-3" }
 */
function extractUUIDs(val, collected = new Set()) {
    if (!val) return collected;
    if (isUUID(val)) collected.add(val);
    else if (Array.isArray(val)) for (const v of val) extractUUIDs(v, collected);
    else if (typeof val === 'object') for (const v of Object.values(val)) extractUUIDs(v, collected);
    return collected;
}

/**
 * Recursively replaces UUIDs in any nested structure with their resolved asset objects.
 * Non-UUID strings are preserved as-is.
 * @param {*} val - Value to resolve.
 * @param {Map<string, object>} assetMap - Map of UUID → asset object from the DB.
 * @returns {*} The same structure with UUIDs replaced by asset objects, or null if not found.
 *
 * @example
 * resolveUUIDs({ weapon: "uuid-1" }, assetMap)
 * // → { weapon: { id: "uuid-1", name: "Sword", ... } }
 */
function resolveUUIDs(val, assetMap) {
    if (val === null || val === undefined) return val;
    if (isUUID(val)) return assetMap.get(val) ?? null;
    if (typeof val === 'string') return val;
    if (Array.isArray(val)) return val.map(v => resolveUUIDs(v, assetMap));
    if (typeof val === 'object') {
        return Object.fromEntries(
            Object.entries(val).map(([k, v]) => [k, resolveUUIDs(v, assetMap)])
        );
    }
    return val;
}