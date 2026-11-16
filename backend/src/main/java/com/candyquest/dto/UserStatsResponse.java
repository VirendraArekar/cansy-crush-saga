package com.candyquest.dto;

import java.util.Map;

public class UserStatsResponse {
    private Long userId;
    private String username;
    private String avatar;
    private Integer coins;
    private Integer lives;
    private Integer maxLives;
    private Integer unlockedLevel;
    private Integer totalStars;
    private Long totalScore;
    private Map<String, Integer> boosters;

    public UserStatsResponse() {}

    public UserStatsResponse(Long userId, String username, String avatar, Integer coins, 
                             Integer lives, Integer maxLives, Integer unlockedLevel, 
                             Integer totalStars, Long totalScore, Map<String, Integer> boosters) {
        this.userId = userId;
        this.username = username;
        this.avatar = avatar;
        this.coins = coins;
        this.lives = lives;
        this.maxLives = maxLives;
        this.unlockedLevel = unlockedLevel;
        this.totalStars = totalStars;
        this.totalScore = totalScore;
        this.boosters = boosters;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long userId;
        private String username;
        private String avatar;
        private Integer coins;
        private Integer lives;
        private Integer maxLives;
        private Integer unlockedLevel;
        private Integer totalStars;
        private Long totalScore;
        private Map<String, Integer> boosters;

        public Builder userId(Long userId) { this.userId = userId; return this; }
        public Builder username(String username) { this.username = username; return this; }
        public Builder avatar(String avatar) { this.avatar = avatar; return this; }
        public Builder coins(Integer coins) { this.coins = coins; return this; }
        public Builder lives(Integer lives) { this.lives = lives; return this; }
        public Builder maxLives(Integer maxLives) { this.maxLives = maxLives; return this; }
        public Builder unlockedLevel(Integer unlockedLevel) { this.unlockedLevel = unlockedLevel; return this; }
        public Builder totalStars(Integer totalStars) { this.totalStars = totalStars; return this; }
        public Builder totalScore(Long totalScore) { this.totalScore = totalScore; return this; }
        public Builder boosters(Map<String, Integer> boosters) { this.boosters = boosters; return this; }

        public UserStatsResponse build() {
            return new UserStatsResponse(userId, username, avatar, coins, lives, maxLives, unlockedLevel, totalStars, totalScore, boosters);
        }
    }

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
    public Integer getMaxLives() { return maxLives; }
    public void setMaxLives(Integer maxLives) { this.maxLives = maxLives; }
    public Integer getUnlockedLevel() { return unlockedLevel; }
    public void setUnlockedLevel(Integer unlockedLevel) { this.unlockedLevel = unlockedLevel; }
    public Integer getTotalStars() { return totalStars; }
    public void setTotalStars(Integer totalStars) { this.totalStars = totalStars; }
    public Long getTotalScore() { return totalScore; }
    public void setTotalScore(Long totalScore) { this.totalScore = totalScore; }
    public Map<String, Integer> getBoosters() { return boosters; }
    public void setBoosters(Map<String, Integer> boosters) { this.boosters = boosters; }
}
