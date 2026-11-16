CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(50) DEFAULT '🍭',
    coins INT DEFAULT 500,
    lives INT DEFAULT 5,
    max_lives INT DEFAULT 5,
    last_life_regen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unlocked_level INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS level_definitions (
    id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    episode VARCHAR(100) NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    move_limit INT NOT NULL,
    time_limit_seconds INT,
    star1_score INT NOT NULL,
    star2_score INT NOT NULL,
    star3_score INT NOT NULL,
    allowed_colors VARCHAR(100) NOT NULL,
    objectives_json TEXT NOT NULL,
    layout_json TEXT
);

CREATE TABLE IF NOT EXISTS level_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    level_id INT NOT NULL,
    score INT NOT NULL DEFAULT 0,
    stars INT NOT NULL DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_level UNIQUE(user_id, level_id)
);

CREATE TABLE IF NOT EXISTS inventories (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    booster_type VARCHAR(50) NOT NULL,
    quantity INT DEFAULT 0,
    CONSTRAINT uq_user_booster UNIQUE(user_id, booster_type)
);

CREATE TABLE IF NOT EXISTS leaderboard_entries (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    username VARCHAR(50) NOT NULL,
    avatar VARCHAR(50) NOT NULL,
    total_score BIGINT DEFAULT 0,
    highest_level INT DEFAULT 1,
    total_stars INT DEFAULT 0,
    period VARCHAR(20) DEFAULT 'GLOBAL'
);

CREATE TABLE IF NOT EXISTS friends (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    friend_id BIGINT NOT NULL,
    status VARCHAR(20) DEFAULT 'ACCEPTED',
    lives_sent_today BOOLEAN DEFAULT FALSE
);
