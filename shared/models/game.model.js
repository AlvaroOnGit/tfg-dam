/**
 * Model for games
 * Responsible for accessing, updating, deleting and creating game related information on the database.
 */
import pool from '../../db/connection.js';

const GAME_SELECT = `
    id, 
    slug, 
    name, 
    description, 
    genres, 
    cover_url AS "coverUrl",
    icon_url AS "iconUrl"
`;

export class GameModel {

  static async findAllGames({ name, genres, page, limit } = {}) {
    const conditions = [`is_active = TRUE`];
    const values = [];
    let i = 1;

    if (name) {
      conditions.push(`name ILIKE $${i++}`);
      values.push(`%${name}%`);
    }

    if (genres) {
      const genreArray = Array.isArray(genres) ? genres : [genres];
      conditions.push(`$${i++}::text[] <@ ARRAY(SELECT lower(g) FROM unnest(genres) g)`);
      values.push(genreArray.map(g => g.toLowerCase()));
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    const res = await pool.query(
        `SELECT ${GAME_SELECT},
        COUNT(*) OVER() AS "total"
        FROM games
        ${where}
        LIMIT $${i} OFFSET $${i + 1}`,
        [...values, limit, offset]
    );

    const total = res.rows.length > 0 ? parseInt(res.rows[0].total) : 0;
    const games = res.rows.map(({ total, ...game }) => game);

    return { total, games };
  }

  static async findGameBySlug(slug) {
    const res = await pool.query(`
    SELECT ${GAME_SELECT} 
    FROM games
    WHERE slug = $1 AND is_active = true`, [slug]);

    return res.rows[0];
  }
}
