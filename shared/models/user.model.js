/**
 * Model for users
 * Responsible for accessing, updating, deleting and creating user related information on the database.
 */

import pool from '../../db/connection.js';

const USER_SELECT = `
    id, 
    email,username, 
    password, 
    role, 
    role_level AS roleLevel, 
    avatar, 
    state, 
    is_verified AS isVerified
`

export class UserModel {

    static async findByEmail(email) {
        const res = await pool.query(`
            SELECT ${USER_SELECT}
            FROM users WHERE LOWER(email) = LOWER($1)`, [email]
        )
        return res.rows[0];
    }
    static async findByUsername(username) {
        const res = await pool.query(`
            SELECT ${USER_SELECT} 
            FROM users WHERE LOWER(username) = LOWER($1)`, [username]
        )
        return res.rows[0];
    }
    static async findById(id) {
        const res = await pool.query(`
            SELECT ${USER_SELECT}
            FROM users WHERE id = $1`, [id]
        )
        return res.rows[0];
    }
    static async createUser(user) {
        const res = await pool.query(`
            INSERT INTO users (email, username, password, role, role_level, avatar, state, is_verified)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, username, email`,
            [
                user.email,
                user.username,
                user.passwordHash,
                user.role,
                user.roleLevel,
                user.avatar,
                user.state,
                user.isVerified
            ]
        )
        return res.rows[0]
    }
<<<<<<< 20-crear-endpoints-de-usuario

    /*static async findPrivateProfileById(id) {
        const res = await pool.query(`
            SELECT id, username, email, role, role_level AS "roleLevel", avatar AS "avatarUrl", state
            FROM users
            WHERE id = $1
        `, [id]);
        return res.rows[0];
    }

    static async findPublicProfileById(id) {
        const res = await pool.query(`
            SELECT id, username, avatar AS "avatarUrl", state
            FROM users
            WHERE id = $1
        `, [id]);
        return res.rows[0];
    }
    */
   
   static async #findProfileById(id, columns) {
    const res = await pool.query(`
        SELECT ${columns}
        FROM users
        WHERE id = $1
    `, [id]);
    return res.rows[0];
    }

    static async findPrivateProfileById(id) {
    return UserModel.#findProfileById(id,
        `id, username, email, role, role_level AS "roleLevel", avatar AS "avatarUrl", state`
    );
    }

    static async findPublicProfileById(id) {
    return UserModel.#findProfileById(id,
        `id, username, avatar AS "avatarUrl", state`
    );
    }
=======
    static async updateUserPassword(id, password) {
        const res = await pool.query(`
            UPDATE users SET password = $1 WHERE id = $2`,
            [password, id]
        );
        return res.rows[0];
    }
>>>>>>> dev
}