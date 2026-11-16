package com.candyquest.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "level_progress", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "level_id"})
})
public class LevelProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "level_id", nullable = false)
    private Integer levelId;

    private Integer score = 0;
    private Integer stars = 0;
    private Boolean completed = false;
    private LocalDateTime completedAt = LocalDateTime.now();

    public LevelProgress() {}

    public LevelProgress(Long id, Long userId, Integer levelId, Integer score, Integer stars, Boolean completed, LocalDateTime completedAt) {
        this.id = id;
        this.userId = userId;
        this.levelId = levelId;
        this.score = score != null ? score : 0;
        this.stars = stars != null ? stars : 0;
        this.completed = completed != null ? completed : false;
        this.completedAt = completedAt != null ? completedAt : LocalDateTime.now();
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private Long userId;
        private Integer levelId;
        private Integer score = 0;
        private Integer stars = 0;
        private Boolean completed = false;
        private LocalDateTime completedAt = LocalDateTime.now();

        public Builder id(Long id) { this.id = id; return this; }
        public Builder userId(Long userId) { this.userId = userId; return this; }
        public Builder levelId(Integer levelId) { this.levelId = levelId; return this; }
        public Builder score(Integer score) { this.score = score; return this; }
        public Builder stars(Integer stars) { this.stars = stars; return this; }
        public Builder completed(Boolean completed) { this.completed = completed; return this; }
        public Builder completedAt(LocalDateTime completedAt) { this.completedAt = completedAt; return this; }

        public LevelProgress build() {
            return new LevelProgress(id, userId, levelId, score, stars, completed, completedAt);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Integer getLevelId() { return levelId; }
    public void setLevelId(Integer levelId) { this.levelId = levelId; }
    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
    public Integer getStars() { return stars; }
    public void setStars(Integer stars) { this.stars = stars; }
    public Boolean getCompleted() { return completed; }
    public void setCompleted(Boolean completed) { this.completed = completed; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
}
