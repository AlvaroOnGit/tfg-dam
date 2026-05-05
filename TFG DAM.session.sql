ALTER TABLE refresh_tokens
    ALTER COLUMN expires_at
        SET DEFAULT CURRENT_TIMESTAMP + INTERVAL '7 days';