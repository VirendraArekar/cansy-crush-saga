package com.candyquest.dto;

public class AuthResponse {
    private String token;
    private Long userId;
    private String username;
    private String avatar;
    private Integer coins;
    private Integer lives;
    private Integer unlockedLevel;

    public AuthResponse() {}

    public AuthResponse(String token, Long userId, String username, String avatar, Integer coins, Integer lives, Integer unlockedLevel) {
        this.token = token;
        this.userId = userId;
        this.username = username;
        this.avatar = avatar;
        this.coins = coins;
        this.lives = lives;
        this.unlockedLevel = unlockedLevel;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String token;
        private Long userId;
        private String username;
        private String avatar;
        private Integer coins;
        private Integer lives;
        private Integer unlockedLevel;

        public Builder token(String token) { this.token = token; return this; }
        public Builder userId(Long userId) { this.userId = userId; return this; }
        public Builder username(String username) { this.username = username; return this; }
        public Builder avatar(String avatar) { this.avatar = avatar; return this; }
        public Builder coins(Integer coins) { this.coins = coins; return this; }
        public Builder lives(Integer lives) { this.lives = lives; return this; }
        public Builder unlockedLevel(Integer unlockedLevel) { this.unlockedLevel = unlockedLevel; return this; }

        public AuthResponse build() {
            return new AuthResponse(token, userId, username, avatar, coins, lives, unlockedLevel);
        }
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
    public Integer getCoins() { return coins; }
    public void setCoins(Integer coins) { this.coins = coins; }
    public Integer getLives() { return lives; }
    public void setLives(Integer lives) { this.lives = lives; }
    public Integer getUnlockedLevel() { return unlockedLevel; }
    public void setUnlockedLevel(Integer unlockedLevel) { this.unlockedLevel = unlockedLevel; }
}
