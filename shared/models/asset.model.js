/**
 * Model for game assets
 * Responsible for accessing game asset related information on the database.
 */

import pool from '../../db/connection.js';

export class AssetModel {

    static async findAllAssets({ gameSlug, name, type, category, page, limit }) {
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
                    ga.data,
                    COUNT(*) OVER() AS "total"
             FROM game_assets ga
             JOIN games g ON ga.game_id = g.id
             WHERE ${whereClause}
             ORDER BY ga.name
             LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
            [...values, limit, offset]
        );

        const total = res.rows.length > 0 ? parseInt(res.rows[0].total) : 0;
        const assets = res.rows.map(({ total, ...asset }) => asset);

        return { total, assets };
    }

    static async findAssetById(id) {
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

    static async fetchAssets(ids) {
        if (!ids.length) return new Map();

        const { rows } = await pool.query(
            `SELECT
            id,
            name,
            slug,
            type,
            category,
            description,
            short_description  AS "shortDescription",
            icon_url           AS "iconUrl",
            data
        FROM game_assets
        WHERE id = ANY($1)`,
            [ids]
        );

        return new Map(rows.map(a => [a.id, a]));
    }
}