/**
 * Game model
 * Handles reading games data from the database.
 */
import pool from '../../db/connection.js';

export class GameModel {

  static async getGames({ page = 1, limit = 15, name, genre } = {}) {
    const pageNum = Number(page) || 1;
    const limitNum = Math.min(50, Math.max(1, Number(limit) || 15));
    const offset = (pageNum - 1) * limitNum;

    // Build dynamic where clause
    const whereParts = ['is_active = true'];
    const values = [];
    let idx = 1;

    if (name) {
      whereParts.push(`LOWER(name) LIKE LOWER($${idx})`);
      values.push(`%${name}%`);
      idx++;
    }

    if (genre && Array.isArray(genre) && genre.length > 0) {
      whereParts.push(`genres && $${idx}::text[]`);
      values.push(genre);
      idx++;
    }

    const whereClause = whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : '';

    // Query to fetch games
    const query = `SELECT id, slug, name, description, genres, cover_url AS "coverUrl", icon_url AS "iconUrl" 
                   FROM games ${whereClause} 
                   ORDER BY name 
                   LIMIT $${idx} OFFSET $${idx + 1}`;
    values.push(limitNum, offset);
    const res = await pool.query(query, values);

    const games = res.rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      description: r.description,
      genre: r.genres,
      coverUrl: r.coverUrl,
      iconUrl: r.iconUrl,
    }));

    // Total count for pagination
    const countQuery = `SELECT COUNT(*) FROM games ${whereClause}`;
    const countRes = await pool.query(countQuery, values.slice(0, -2)); // exclude limit/offset
    const total = parseInt(countRes.rows[0].count, 10);

    return {
      page: pageNum,
      total,
      limit: limitNum,
      games
    };
  }

  static async getGameBySlug(slug) {
    const res = await pool.query(
      `SELECT id, slug, name, description, genres, cover_url AS "coverUrl", icon_url AS "iconUrl" 
       FROM games WHERE slug = $1`,
      [slug]
    );
    const g = res.rows[0];
    if (!g) return null;
    return {
      id: g.id,
      slug: g.slug,
      name: g.name,
      description: g.description,
      genre: g.genres,
      coverUrl: g.coverUrl,
      iconUrl: g.iconUrl
    };
  }
}
