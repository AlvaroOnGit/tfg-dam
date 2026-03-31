----------------------
--- RESET TOKENS ---
----------------------

-- Create the reset_tokens table
CREATE TABLE reset_tokens(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    device_id UUID NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP + INTERVAL '1 hour',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP,
    user_agent TEXT NOT NULL,

    -- Foreign keys
    CONSTRAINT fk_reset_tokens_users_id FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE
);

-- Declare refresh_tokens indexes
-- Search all invalid tokens
CREATE INDEX reset_tokens_invalid_tokens
    ON reset_tokens(expires_at)
    WHERE revoked_at IS NOT NULL;

-- Declare comments for the reset_tokens table
COMMENT ON TABLE reset_tokens IS 'Stores reset tokens and their expirations';
COMMENT ON COLUMN reset_tokens.id IS 'Unique UUID for the token';
COMMENT ON COLUMN reset_tokens.user_id IS 'Foreign key to users.id';
COMMENT ON COLUMN reset_tokens.device_id IS 'UUID for the device the token was created on, provided and validated on backend';
COMMENT ON COLUMN reset_tokens.token IS 'Reset token, stored as a hash';
COMMENT ON COLUMN reset_tokens.expires_at IS 'Date for token expiration';
COMMENT ON COLUMN reset_tokens.created_at IS 'Date for token creation';
COMMENT ON COLUMN reset_tokens.revoked_at IS 'Date the token was revoked';
COMMENT ON COLUMN reset_tokens.user_agent IS 'Information about the tokens user-agent';