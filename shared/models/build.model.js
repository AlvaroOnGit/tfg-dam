/**
 * Model for builds
 * Responsible for accessing, updating, deleting and creating build related information on the database.
 */

import pool from '../../db/connection.js';

const BUILD_SELECT = `
    id, game_id AS "gameId", creator_id AS "creatorId", name, description,
    is_public AS "isPublic", is_published AS "isPublished", version,
    game_version AS "gameVersion", tags, template_data AS "templateData",
    created_at AS "createdAt", updated_at AS "updatedAt"
`;

export class BuildModel {

    static async findAllBuilds({ gameSlug, name, tags, creator, page, limit } = {}) {
        const conditions = [];
        const values = [];
        let i = 1;

        if (gameSlug) {
            conditions.push(`g.slug = $${i++}`);
            values.push(gameSlug);
        }

        if (name) {
            conditions.push(`b.name ILIKE $${i++}`);
            values.push(`%${name}%`);
        }

        if (tags) {
            const tagArray = Array.isArray(tags) ? tags : [tags];
            conditions.push(`b.tags && $${i++}`);
            values.push(tagArray);
        }

        if (creator) {
            conditions.push(`b.creator_id = $${i++}`);
            values.push(creator);
        }

        const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        const offset = (page - 1) * limit;

        const res = await pool.query(
            `SELECT
                 b.id, 
                 b.game_id AS "gameId", 
                 b.creator_id AS "creatorId", 
                 b.name, 
                 b.description,
                 b.is_public AS "isPublic", 
                 b.is_published AS "isPublished", 
                 b.version,
                 b.game_version AS "gameVersion", 
                 b.tags, 
                 b.template_data AS "templateData",
                 b.created_at AS "createdAt", 
                 b.updated_at AS "updatedAt",
                 COUNT(*) OVER() AS "total"
            FROM builds b 
            LEFT JOIN games g ON g.id = b.game_id 
            ${where}
            ORDER BY b.created_at DESC
            LIMIT $${i} OFFSET $${i + 1}`,
            [...values, limit, offset]
        );

        const total = res.rows.length > 0 ? parseInt(res.rows[0].total) : 0;
        const builds = res.rows.map(({ total, ...build }) => build);

        return { total, builds };
    }

    static async findBuildById(id) {
        const resBuild = await pool.query(`
                    SELECT ${BUILD_SELECT}
                    FROM builds
                    WHERE id = $1`,
            [id]
        );

        const build = resBuild.rows[0];
        if (!build) return null;

        const resAssets = await pool.query(`
        SELECT 
            asset_id AS "assetId", 
            slot_category AS "slotCategory",
            slot_name AS "slotName"
        FROM build_assets WHERE build_id = $1`,
            [id]
        );

        return { ...build, assets: resAssets.rows };
    }

    static async createBuild(build, assets) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const buildRes = await client.query(`
                INSERT INTO builds (
                    game_id,
                    creator_id,
                    name,
                    description,
                    is_public,
                    is_published,
                    version,
                    game_version,
                    tags,
                    template_data
                )
                VALUES ((SELECT id FROM games WHERE slug = $1), $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING ${BUILD_SELECT}`, [
                build.gameSlug,
                build.creatorId,
                build.name,
                build.description ?? null,
                build.isPublic ?? false,
                build.isPublished ?? false,
                build.version ?? '1.0',
                build.gameVersion,
                build.tags ?? [],
                build.templateData ?? null,
            ]);

            const newBuild = buildRes.rows[0];
            let newAssets = [];

            if (assets.length > 0) {
                const values = [];
                const placeholders = assets.map((asset, index) => {
                    const i = index * 4;
                    values.push(asset.assetId, asset.slotCategory, asset.slotName, newBuild.id);
                    return `($${i + 1}, $${i + 2}, $${i + 3}, $${i + 4})`;
                }).join(', ');

                const assetsRes = await client.query(`
                    INSERT INTO build_assets (asset_id, slot_category, slot_name, build_id)
                    VALUES ${placeholders}
                RETURNING asset_id AS "assetId", slot_category AS "slotCategory", slot_name AS "slotName"
                `, values);

                newAssets = assetsRes.rows;
            }

            await client.query('COMMIT');
            return { ...newBuild, assets: newAssets };

        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }

    static async updateBuild(id, build, assets) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            //TODO: Coalesce doesn't support null fields.
            // Updating a field as null will be ignored
            const resBuild = await client.query(`
            UPDATE builds SET
                name          = COALESCE($1, name),
                description   = COALESCE($2, description),
                is_public     = COALESCE($3, is_public),
                is_published  = COALESCE($4, is_published),
                version       = COALESCE($5, version),
                game_version  = COALESCE($6, game_version),
                tags          = COALESCE($7, tags),
                template_data = COALESCE($8, template_data)
            WHERE id = $9
            RETURNING ${BUILD_SELECT}`, [
                build.name,
                build.description,
                build.isPublic,
                build.isPublished,
                build.version,
                build.gameVersion,
                build.tags,
                build.templateData,
                id,
            ]);

            const updatedBuild = resBuild.rows[0];
            let updatedAssets;

            if (assets !== undefined) {
                await client.query(`DELETE FROM build_assets WHERE build_id = $1`, [id]);

                if (assets.length > 0) {
                    const values = [];
                    const placeholders = assets.map((asset, index) => {
                        const i = index * 4;
                        values.push(asset.assetId, asset.slotCategory, asset.slotName, id);
                        return `($${i + 1}, $${i + 2}, $${i + 3}, $${i + 4})`;
                    }).join(', ');

                    const resAssets = await client.query(`
                    INSERT INTO build_assets (asset_id, slot_category, slot_name, build_id)
                    VALUES ${placeholders}
                    RETURNING asset_id AS "assetId", slot_category AS "slotCategory", slot_name AS "slotName"
                    `, values);

                    updatedAssets = resAssets.rows;
                }
            }

            await client.query('COMMIT');
            return { ...updatedBuild, assets: updatedAssets };
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }

    static async deleteBuild(id) {
        await pool.query(`DELETE FROM builds WHERE id = $1`, [id]);
    }

    static async getBuildPermissions(buildId) {
        const res = await pool.query(`
            SELECT b.creator_id AS id, 'creator'::text AS role, u.username
            FROM builds b
                     JOIN users u ON u.id = b.creator_id
            WHERE b.id = $1

            UNION ALL

            SELECT be.user_id AS id, be.role::text, u.username
            FROM build_editors be
                     JOIN users u ON u.id = be.user_id
            WHERE be.build_id = $1
        `, [buildId]);

        return res.rows;
    }

    static async grantEditPermission(buildId, userId, userRole) {
        const res = await pool.query(`
        INSERT INTO build_editors (build_id, user_id, role)
        VALUES ($1, $2, $3)
        RETURNING build_id AS "buildId", user_id AS "user_id", role`, [
            buildId,
            userId,
            userRole ?? 'editor'
        ]);
        return res.rows[0];
    }

    static async revokeEditPermission(buildId, userId) {
        const res = await pool.query(`
        DELETE FROM build_editors WHERE build_id = $1 AND user_id = $2`, [buildId, userId]
        );
        return res.rowCount > 0;
    }
}