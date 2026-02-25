-- Utilize pgcrypto to create UUID's
CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- Utilize pg_trgm for partial matches
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create a function to update the updated_at field on tables
CREATE OR REPLACE FUNCTION refresh_updated_at()
    RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

---------------------
------- USERS -------
---------------------

-- Declare user enums
CREATE TYPE user_role AS ENUM('user', 'admin');
CREATE TYPE user_role_level AS ENUM('normal','super');
CREATE TYPE user_state AS ENUM('active','banned','restricted');

-- Creates the users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(100) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'user',
    role_level user_role_level NOT NULL DEFAULT 'normal',
    avatar TEXT,
    state user_state NOT NULL DEFAULT 'active',
    is_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP

    -- Checks
    CONSTRAINT check_email_format CHECK (email ~ '^[^@]+@[^@]+\.[^@]+$'),
    CONSTRAINT check_username_format CHECK (username ~ '^[a-zA-Z0-9_]+$'),
    CONSTRAINT check_email_not_blank CHECK (length(trim(email)) > 0),
    CONSTRAINT check_username_not_blank CHECK (length(trim(username)) > 0)
);
-- Declare user index
CREATE INDEX users_username_lower
    ON users (LOWER(username));

-- Declare user triggers
CREATE TRIGGER trigger_update_users
    BEFORE UPDATE ON users
    FOR EACH ROW
EXECUTE FUNCTION refresh_updated_at();

-- Declare comments for the users table
COMMENT ON TABLE users IS 'Stores application users and their authentication data';
COMMENT ON COLUMN users.id IS 'Unique UUID for the user';
COMMENT ON COLUMN users.email IS 'Email for the user, unique';
COMMENT ON COLUMN users.username IS 'Username for the user, unique';
COMMENT ON COLUMN users.password IS 'Password for the user, stored as a hash';
COMMENT ON COLUMN users.role IS 'Role for the user (''user'',''admin'')';
COMMENT ON COLUMN users.role_level IS 'Level for the role (''normal'',''super'')';
COMMENT ON COLUMN users.avatar IS 'Avatar for the user';
COMMENT ON COLUMN users.state IS 'State of the user (''active'',''banned'',''restricted'')';
COMMENT ON COLUMN users.is_verified IS 'Indicates whether the user has verified their account';
COMMENT ON COLUMN users.created_at IS 'Date of user creation';
COMMENT ON COLUMN users.updated_at IS 'Date of last update';

---------------------
------- GAMES -------
---------------------

-- Creates the games table
CREATE TABLE games(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    genres TEXT[] NOT NULL DEFAULT '{}',
    cover_url TEXT,
    icon_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Declare game indexes
-- Search by name (partial match)
CREATE INDEX games_name_partial
ON games
USING GIN (name gin_trgm_ops)
WHERE is_active = true;
-- Search by genre
CREATE INDEX games_genres
    ON games
    USING GIN (genres)
    WHERE is_active = true;

-- Declare games triggers
CREATE TRIGGER trigger_update_games
    BEFORE UPDATE ON games
    FOR EACH ROW
EXECUTE FUNCTION refresh_updated_at();

-- Declare comments for the users table
COMMENT ON TABLE games IS 'Stores application games and their data';
COMMENT ON COLUMN games.id IS 'Unique UUID for the game';
COMMENT ON COLUMN games.name IS 'Name for the game, unique';
COMMENT ON COLUMN games.slug IS 'Url-friendly name for the game, unique';
COMMENT ON COLUMN games.description IS 'Description for the game';
COMMENT ON COLUMN games.genres IS 'Genres for the game, must be an array of strings';
COMMENT ON COLUMN games.cover_url IS 'Url for the cover of the game';
COMMENT ON COLUMN games.icon_url IS 'Url for the icon of the game';
COMMENT ON COLUMN games.is_active IS 'Indicates whether the game is active or not';
COMMENT ON COLUMN games.created_at IS 'Date of game creation';
COMMENT ON COLUMN games.updated_at IS 'Date of last update';

---------------------
------- BUILDS ------
---------------------

-- Creates the builds table
CREATE TABLE builds(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL,
    creator_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_public boolean NOT NULL DEFAULT false,
    is_published boolean NOT NULL DEFAULT false,
    version VARCHAR(10) NOT NULL DEFAULT '1.0',
    game_version TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    template_data JSONB DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Foreign keys
    CONSTRAINT fk_builds_games FOREIGN KEY (game_id)
        REFERENCES games (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_builds_users FOREIGN KEY (creator_id)
        REFERENCES users (id)
        ON DELETE CASCADE
);

-- Declare game indexes
-- Search by name (partial match)
CREATE INDEX builds_name_partial
    ON builds
        USING GIN (name gin_trgm_ops)
    WHERE is_public = true AND is_published = true;
-- Search by tags
CREATE INDEX builds_tags
    ON builds
        USING GIN (tags)
    WHERE is_public = true AND is_published = true;
-- Search by creator
CREATE INDEX builds_creator_id
    ON builds (creator_id);
-- Search by game
CREATE INDEX builds_game_id
    ON builds (game_id);

-- Declare builds triggers
CREATE TRIGGER trigger_update_builds
    BEFORE UPDATE ON builds
    FOR EACH ROW
EXECUTE FUNCTION refresh_updated_at();

-- Declare comments for the builds table
COMMENT ON TABLE builds IS 'Stores application builds and their data';
COMMENT ON COLUMN builds.id IS 'Unique UUID for the build';
COMMENT ON COLUMN builds.game_id IS 'Foreign key to games.id';
COMMENT ON COLUMN builds.creator_id IS 'Foreign key to users.id';
COMMENT ON COLUMN builds.name IS 'Name for the build';
COMMENT ON COLUMN builds.description IS 'Description for the build (Can be HTML)';
COMMENT ON COLUMN builds.is_public IS 'Indicates whether the build is public or not';
COMMENT ON COLUMN builds.is_published IS 'Indicates whether the build is published or not';
COMMENT ON COLUMN builds.version IS 'Build version';
COMMENT ON COLUMN builds.game_version IS 'Game version';
COMMENT ON COLUMN builds.tags IS 'Tags for the build, must be an array of strings';
COMMENT ON COLUMN builds.template_data IS 'Dynamic JSON depending on the game';
COMMENT ON COLUMN builds.created_at IS 'Date of build creation';
COMMENT ON COLUMN builds.updated_at IS 'Date of last update';

---------------------
---- GAME ASSETS ----
---------------------

-- Create the game_assets table
CREATE TABLE game_assets(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    slug TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    category VARCHAR(50),
    description TEXT,
    short_description VARCHAR(250),
    icon_url TEXT,
    data JSONB,
    tags TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Foreign keys
    CONSTRAINT fk_game_assets_games FOREIGN KEY (game_id)
        REFERENCES games (id)
        ON DELETE CASCADE,
    -- Constraints
    -- A game can only have an asset with a unique slug
    CONSTRAINT unique_game_asset_slug UNIQUE (game_id, slug)
);

-- Declare game_asset indexes
-- Search by game_id
CREATE INDEX game_assets_game_id
    ON game_assets (game_id)
    WHERE is_active = true;
-- Search by slug
CREATE INDEX game_assets_slug
    ON game_assets (slug)
    WHERE is_active = true;
-- Search by name (partial match)
CREATE INDEX game_assets_name_partial
    ON game_assets
        USING GIN (name gin_trgm_ops)
    WHERE is_active = true;
-- Search by type
CREATE INDEX game_assets_type
    ON game_assets (type)
    WHERE is_active = true;
-- Search by category
CREATE INDEX game_assets_category
    ON game_assets (category)
    WHERE is_active = true;
-- Search by tags
CREATE INDEX game_assets_tags
    ON game_assets
        USING GIN (tags)
    WHERE is_active = true;

-- Declare game_asset triggers
CREATE TRIGGER trigger_update_game_assets
    BEFORE UPDATE ON game_assets
    FOR EACH ROW
EXECUTE FUNCTION refresh_updated_at();

-- Declare comments for the game_assets table
COMMENT ON TABLE game_assets IS 'Stores game assets and their data';
COMMENT ON COLUMN game_assets.id IS 'Unique UUID for the asset';
COMMENT ON COLUMN game_assets.game_id IS 'Foreign key to games.id';
COMMENT ON COLUMN game_assets.name IS 'Name for the asset';
COMMENT ON COLUMN game_assets.slug IS 'Url-friendly name for the asset. Must be unique per game';
COMMENT ON COLUMN game_assets.type IS 'Type for the asset. Types are defined and validated on backend for each game';
COMMENT ON COLUMN game_assets.category IS 'Category for the asset. Categories are defined and validated on backend for each game';
COMMENT ON COLUMN game_assets.description IS 'Description for the asset';
COMMENT ON COLUMN game_assets.short_description IS 'Short description for the asset';
COMMENT ON COLUMN game_assets.icon_url IS 'Url for the icon of the asset';
COMMENT ON COLUMN game_assets.data IS 'Dynamic JSON depending on the asset';
COMMENT ON COLUMN game_assets.tags IS 'Tags for the asset, must be an array of strings';
COMMENT ON COLUMN game_assets.is_active IS 'Whether the asset is active or not';
COMMENT ON COLUMN game_assets.created_at IS 'Date of build creation';
COMMENT ON COLUMN game_assets.updated_at IS 'Date of last update';

--------------------
--- BUILD ASSETS ---
--------------------

-- Create the build_assets table
CREATE TABLE build_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    build_id UUID NOT NULL,
    asset_id UUID NOT NULL,
    slot_category VARCHAR(50) NOT NULL,
    slot_name VARCHAR(100) NOT NULL,

    -- Foreign keys
    CONSTRAINT fk_build_assets_builds FOREIGN KEY (build_id)
        REFERENCES builds (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_build_assets_game_assets FOREIGN KEY  (asset_id)
        REFERENCES  game_assets (id)
        ON DELETE CASCADE,
    -- Constraints
    -- A build cannot contain two assets on the same slot
    CONSTRAINT unique_slot UNIQUE (build_id, slot_name)
);

-- Declare build_assets indexes
-- Search assets for a build by its build_id
CREATE INDEX build_assets_build_id
    ON build_assets (build_id);

-- Validators
-- Checks if the asset and build match game_id (assets and build must be from the same game)
CREATE FUNCTION validate_same_game()
    RETURNS trigger AS $$
BEGIN
    IF NOT EXISTS(
        SELECT 1
        FROM builds
                 JOIN game_assets on game_assets.id = NEW.asset_id
        WHERE builds.id = NEW.build_id
          AND builds.game_id = game_assets.game_id
    ) THEN
        RAISE EXCEPTION 'Asset does not belong to the same game as the build';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Declare triggers for build_assets
CREATE TRIGGER trigger_validate_same_game
    BEFORE INSERT OR UPDATE ON build_assets
    FOR EACH ROW
EXECUTE FUNCTION validate_same_game();

-- Declare comments for the build_assets table
COMMENT ON TABLE build_assets IS 'Stores the assets used on each build';
COMMENT ON COLUMN build_assets.id IS 'Unique UUID for the connection';
COMMENT ON COLUMN build_assets.build_id IS 'Foreign key to builds.id';
COMMENT ON COLUMN build_assets.asset_id IS 'Foreign key to game_assets.id';
COMMENT ON COLUMN build_assets.slot_category IS 'Category for the slot';
COMMENT ON COLUMN build_assets.slot_name IS 'Name for the slot';

-----------------------
---- BUILD EDITORS ----
-----------------------

-- Declare build_editors enums
CREATE TYPE editor_role AS ENUM('editor', 'co-owner');

-- Create the build_editors table
CREATE TABLE build_editors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    build_id UUID NOT NULL,
    user_id UUID NOT NULL,
    role editor_role NOT NULL DEFAULT 'editor',
    added_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Foreign keys
        CONSTRAINT fk_build_editors_builds_id FOREIGN KEY (build_id)
        REFERENCES builds (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_build_editors_users_id FOREIGN KEY  (user_id)
        REFERENCES  users (id)
        ON DELETE CASCADE,
    -- Constraints
    -- A user cannot have more than one entry per build
    CONSTRAINT unique_build_user UNIQUE (build_id, user_id)
);

-- Declare build_editors indexes
-- Search all builds a user can edit
CREATE INDEX build_editors_user_id
    ON build_editors(user_id);

-- Declare comments for the build_editors table
COMMENT ON TABLE build_editors IS 'Stores user permissions to edit builds';
COMMENT ON COLUMN build_editors.id IS 'Unique UUID for the connection';
COMMENT ON COLUMN build_editors.build_id IS 'Foreign key to builds.id';
COMMENT ON COLUMN build_editors.user_id IS 'Foreign key to users.id';
COMMENT ON COLUMN build_editors.role IS 'Role for the editor (''editor'',''co-owner'')';
COMMENT ON COLUMN build_editors.added_at IS 'Date the registry was added';

----------------------
--- REFRESH TOKENS ---
----------------------

-- Create the refresh_tokens table
CREATE TABLE refresh_tokens(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    device_id UUID NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP,
    user_agent TEXT NOT NULL,

    -- Foreign keys
    CONSTRAINT fk_refresh_tokens_users_id FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE,
    -- Constraints
    -- One token per user per device
    CONSTRAINT single_token_device UNIQUE (user_id, device_id)
);

-- Declare refresh_tokens indexes
-- Search all invalid tokens
CREATE INDEX refresh_tokens_invalid_tokens
    ON refresh_tokens(expires_at)
    WHERE expires_at < NOW() OR revoked_at IS NOT NULL;
-- Active tokens per device
CREATE INDEX refresh_tokens_active_device
    ON refresh_tokens(user_id, device_id)
    WHERE revoked_at IS NULL AND expires_at > NOW();
-- Search tokens by user
CREATE INDEX refresh_tokens_user_tokens
    ON refresh_tokens (user_id);
-- Search token
CREATE INDEX refresh_tokens_token
    ON refresh_tokens (token);

-- Declare comments for the build_editors table
COMMENT ON TABLE refresh_tokens IS 'Stores refresh tokens and their expirations';
COMMENT ON COLUMN refresh_tokens.id IS 'Unique UUID for the token';
COMMENT ON COLUMN refresh_tokens.user_id IS 'Foreign key to users.id';
COMMENT ON COLUMN refresh_tokens.device_id IS 'UUID for the device the token was created on, provided and validated on backend';
COMMENT ON COLUMN refresh_tokens.token IS 'Refresh token, stored as a hash';
COMMENT ON COLUMN refresh_tokens.expires_at IS 'Date for token expiration';
COMMENT ON COLUMN refresh_tokens.created_at IS 'Date for token creation';
COMMENT ON COLUMN refresh_tokens.revoked_at IS 'Date the token was revoked';
COMMENT ON COLUMN refresh_tokens.user_agent IS 'Information about the tokens user-agent';