/**
 * Model for game assets
 * Responsible for accessing game asset related information on the database.
 */

import pool from '../../db/connection.js';

export class AssetModel {

    static async findAll({ gameSlug, name, type, category, page = 1, limit = 15 }) {
        const values = [gameSlug];
        const conditions = ['g.slug = $1', 'ga.is_active = true'];
        let paramIndex = 2;

        if (name) {
            conditions.push(`LOWER(ga.name) LIKE LOWER($${paramIndex})`);
            values.push(`%${name}%`);
            paramIndex++;
        }

        if (type) {
            conditions.push(`ga.type = $${paramIndex}`);
            values.push(type);
            paramIndex++;
        }

        if (category) {
            conditions.push(`ga.category = $${paramIndex}`);
            values.push(category);
            paramIndex++;
        }

        const whereClause = conditions.join(' AND ');
        const offset = (page - 1) * limit;

        const countRes = await pool.query(
            `SELECT COUNT(*)
             FROM game_assets ga
             JOIN games g ON ga.game_id = g.id
             WHERE ${whereClause}`,
            values
        );

        const total = parseInt(countRes.rows[0].count);

        const dataRes = await pool.query(
            `SELECT ga.id,
                    json_build_object('id', g.id, 'name', g.name, 'slug', g.slug) AS game,
                    ga.name,
                    ga.slug,
                    ga.type,
                    ga.category,
                    ga.description,
                    ga.short_description AS "shortDescription",
                    ga.icon_url AS "iconUrl",
                    ga.data
             FROM game_assets ga
             JOIN games g ON ga.game_id = g.id
             WHERE ${whereClause}
             ORDER BY ga.name ASC
             LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
            [...values, limit, offset]
        );

        return { total, assets: dataRes.rows };
    }

    static async findById(id) {
        const res = await pool.query(
            `SELECT ga.id,
                    json_build_object('id', g.id, 'name', g.name, 'slug', g.slug) AS game,
                    ga.name,
                    ga.slug,
                    ga.type,
                    ga.category,
                    ga.description,
                    ga.short_description AS "shortDescription",
                    ga.icon_url AS "iconUrl",
                    ga.data
             FROM game_assets ga
             JOIN games g ON ga.game_id = g.id
             WHERE ga.id = $1`,
            [id]
        );
        return res.rows[0];
    }
}
