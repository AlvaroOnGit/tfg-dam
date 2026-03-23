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

    static async findAll({ gameSlug, name, tags, creator, page = 1, limit = 20 } = {}) {
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
        const limitIndex = i++;
        const offsetIndex = i++;
        values.push(limit, offset);

        const res = await pool.query(`
        SELECT
            b.id, b.game_id AS "gameId", b.creator_id AS "creatorId", b.name, b.description,
            b.is_public AS "isPublic", b.is_published AS "isPublished", b.version,
            b.game_version AS "gameVersion", b.tags, b.template_data AS "templateData",
            b.created_at AS "createdAt", b.updated_at AS "updatedAt"
        FROM builds b
        LEFT JOIN games g ON g.id = b.game_id
        ${where}
        ORDER BY b.created_at DESC
        LIMIT $${limitIndex} OFFSET $${offsetIndex}
    `, values);

        return res.rows;
    }

    static async findById(id) {
        const res = await pool.query(`
            SELECT ${BUILD_SELECT}
            FROM builds WHERE id = $1
        `, [id]);
        return res.rows[0];
    }

    static async create(build) {
        const res = await pool.query(`
            INSERT INTO builds (game_id, creator_id, name, description, is_public, is_published, version, game_version, tags, template_data)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING ${BUILD_SELECT}
        `, [
            build.gameId,
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
        return res.rows[0];
    }

    static async update(id, build) {
        const res = await pool.query(`
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
                RETURNING ${BUILD_SELECT}
        `, [
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
        return res.rows[0];
    }

    static async delete(id) {
        await pool.query(`DELETE FROM builds WHERE id = $1`, [id]);
    }

    static async hasEditPermission(buildId, userId) {
        const res = await pool.query(`
            SELECT 1 FROM builds
            WHERE id = $1 AND creator_id = $2
            UNION
            SELECT 1 FROM build_editors
            WHERE build_id = $1 AND user_id = $2
            LIMIT 1
        `, [buildId, userId]);
        return res.rows.length > 0;
    }
}