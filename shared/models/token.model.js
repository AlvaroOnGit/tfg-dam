/**
 * Model for tokens
 * Responsible for accessing, updating, deleting and creating token related information on the database.
 */
import pool from '../../db/connection.js';

export class TokenModel {

    static saveRefreshToken = async (data) => {
        const res = await pool.query(`
                    INSERT INTO refresh_tokens (user_id, token, device_id, user_agent, expires_at)
                    VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP + ($5 || ' days')::interval) ON CONFLICT (user_id, device_id)
        DO
                    UPDATE SET
                        token = $2,
                        expires_at = CURRENT_TIMESTAMP + ($5 || ' days'):: interval,
                        revoked_at = NULL,
                        created_at = CURRENT_TIMESTAMP`,
            [
                data.user,
                data.token,
                data.device,
                data.agent,
                process.env.JWT_REFRESH_TOKEN_LIFETIME
            ]
        );
        return res.rows[0];
    }
    static revokeRefreshToken = async (id, token) => {
        const res = await pool.query(`
        UPDATE refresh_tokens SET revoked_at = NOW() WHERE token = $1 and user_id = $2
        `, [token, id]
        );
        return res.rows[0];
    }
    static getRefreshToken = async (token) => {
        const res = await pool.query(`
            SELECT * FROM refresh_tokens WHERE token = $1 AND revoked_at IS NULL AND expires_at > NOW()
        `, [token])
        return res.rows[0];
    }
    static saveResetToken = async (data) => {
        const res = await pool.query(`
            INSERT INTO reset_tokens (user_id, token, device_id, user_agent)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (user_id)
            DO UPDATE SET 
                token = $2,
                expires_at = CURRENT_TIMESTAMP + ($5 || ' hour')::interval,
                revoked_at = NULL,
                created_at = CURRENT_TIMESTAMP`,
            [
                data.user,
                data.token,
                data.device,
                data.agent,
                process.env.JWT_RESET_TOKEN_LIFETIME
            ]
        );
        return res.rows[0];
    }
    static revokeResetToken = async (id, token) => {
        const res = await pool.query(`
        UPDATE reset_tokens SET revoked_at = NOW() WHERE token = $1 and user_id = $2
        `, [token, id]
        );
        return res.rows[0];
    }
    static getResetToken = async (token) => {
        const res = await pool.query(`
            SELECT * FROM reset_tokens WHERE token = $1 AND revoked_at IS NULL AND expires_at > NOW()
        `, [token])
        return res.rows[0];
    }
}