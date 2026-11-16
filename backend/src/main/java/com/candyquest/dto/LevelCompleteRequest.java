package com.candyquest.dto;

import jakarta.validation.constraints.NotNull;

public class LevelCompleteRequest {
    @NotNull
    private Integer levelId;

    @NotNull
    private Integer score;

    @NotNull
    private Integer stars;

    private Integer remainingMoves;

    public LevelCompleteRequest() {}

    public LevelCompleteRequest(Integer levelId, Integer score, Integer stars, Integer remainingMoves) {
        this.levelId = levelId;
        this.score = score;
        this.stars = stars;
        this.remainingMoves = remainingMoves;
    }

    public Integer getLevelId() { return levelId; }
    public void setLevelId(Integer levelId) { this.levelId = levelId; }
    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
    public Integer getStars() { return stars; }
    public void setStars(Integer stars) { this.stars = stars; }
    public Integer getRemainingMoves() { return remainingMoves; }
    public void setRemainingMoves(Integer remainingMoves) { this.remainingMoves = remainingMoves; }
}
