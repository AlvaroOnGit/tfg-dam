/**
 * Model for builds
 * Responsible for accessing, updating, deleting and creating build related information on the database.
 */

import pool from '../../db/connection.js';

export class BuildModel {

    static async findAll() {
        const res = await pool.query(`
            SELECT id, game_id AS gameId, creator_id AS creatorId, name, description,
                   is_public AS isPublic, is_published AS isPublished, version,
                   game_version AS gameVersion, tags, template_data AS templateData,
                   created_at AS createdAt, updated_at AS updatedAt
            FROM builds
        `);
        return res.rows;
    }

    static async findById(id) {
        const res = await pool.query(`
            SELECT id, game_id AS gameId, creator_id AS creatorId, name, description,
                   is_public AS isPublic, is_published AS isPublished, version,
                   game_version AS gameVersion, tags, template_data AS templateData,
                   created_at AS createdAt, updated_at AS updatedAt
            FROM builds WHERE id = $1
        `, [id]);
        return res.rows[0];
    }

    static async create(build) {
        const res = await pool.query(`
            INSERT INTO builds (game_id, creator_id, name, description, is_public, is_published, version, game_version, tags, template_data)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id, game_id AS gameId, creator_id AS creatorId, name, description,
                      is_public AS isPublic, is_published AS isPublished, version,
                      game_version AS gameVersion, tags, template_data AS templateData,
                      created_at AS createdAt, updated_at AS updatedAt
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
                name            = COALESCE($1, name),
                description     = COALESCE($2, description),
                is_public       = COALESCE($3, is_public),
                is_published    = COALESCE($4, is_published),
                version         = COALESCE($5, version),
                game_version    = COALESCE($6, game_version),
                tags            = COALESCE($7, tags),
                template_data   = COALESCE($8, template_data)
            WHERE id = $9
            RETURNING id, game_id AS gameId, creator_id AS creatorId, name, description,
                      is_public AS isPublic, is_published AS isPublished, version,
                      game_version AS gameVersion, tags, template_data AS templateData,
                      created_at AS createdAt, updated_at AS updatedAt
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
}