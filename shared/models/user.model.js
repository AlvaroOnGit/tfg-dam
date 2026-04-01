/**
 * Model for users
 * Responsible for accessing, updating, deleting and creating user related information on the database.
 */

import pool from '../../db/connection.js';

export class UserModel {

    static async findByEmail(email) {
        const res = await pool.query(`
            SELECT id, email,username, password, role, role_level AS roleLevel, avatar, state, is_verified AS isVerified
            FROM users WHERE LOWER(email) = LOWER($1)`, [email]
        )
        return res.rows[0];
    }
    static async findByUsername(username) {
        const res = await pool.query(`
            SELECT id, email,username, password, role, role_level AS roleLevel, avatar, state, is_verified AS isVerified
            FROM users WHERE LOWER(username) = LOWER($1)`, [username]
        )
        return res.rows[0];
    }
    static async findById(id) {
        const res = await pool.query(`
            SELECT id, email,username, password, role, role_level AS roleLevel, avatar, state, is_verified AS isVerified
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
    static async updateUserPassword(id, password) {
        const res = await pool.query(`
            UPDATE users SET password = $1 WHERE id = $2`,
            [password, id]
        );
        return res.rows[0];
    }
}