package com.candyquest.model;

import jakarta.persistence.*;

@Entity
@Table(name = "leaderboard_entries")
public class LeaderboardEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 50)
    private String username;

    @Column(nullable = false, length = 50)
    private String avatar;

    private Long totalScore = 0L;
    private Integer highestLevel = 1;
    private Integer totalStars = 0;

    @Column(length = 20)
    private String period = "GLOBAL";

    public LeaderboardEntry() {}

    public LeaderboardEntry(Long id, Long userId, String username, String avatar, Long totalScore, Integer highestLevel, Integer totalStars, String period) {
        this.id = id;
        this.userId = userId;
        this.username = username;
        this.avatar = avatar;
        this.totalScore = totalScore != null ? totalScore : 0L;
        this.highestLevel = highestLevel != null ? highestLevel : 1;
        this.totalStars = totalStars != null ? totalStars : 0;
        this.period = period != null ? period : "GLOBAL";
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private Long userId;
        private String username;
        private String avatar;
        private Long totalScore = 0L;
        private Integer highestLevel = 1;
        private Integer totalStars = 0;
        private String period = "GLOBAL";

        public Builder id(Long id) { this.id = id; return this; }
        public Builder userId(Long userId) { this.userId = userId; return this; }
        public Builder username(String username) { this.username = username; return this; }
        public Builder avatar(String avatar) { this.avatar = avatar; return this; }
        public Builder totalScore(Long totalScore) { this.totalScore = totalScore; return this; }
        public Builder highestLevel(Integer highestLevel) { this.highestLevel = highestLevel; return this; }
        public Builder totalStars(Integer totalStars) { this.totalStars = totalStars; return this; }
        public Builder period(String period) { this.period = period; return this; }

        public LeaderboardEntry build() {
            return new LeaderboardEntry(id, userId, username, avatar, totalScore, highestLevel, totalStars, period);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
    public Long getTotalScore() { return totalScore; }
    public void setTotalScore(Long totalScore) { this.totalScore = totalScore; }
    public Integer getHighestLevel() { return highestLevel; }
    public void setHighestLevel(Integer highestLevel) { this.highestLevel = highestLevel; }
    public Integer getTotalStars() { return totalStars; }
    public void setTotalStars(Integer totalStars) { this.totalStars = totalStars; }
    public String getPeriod() { return period; }
    public void setPeriod(String period) { this.period = period; }
}
