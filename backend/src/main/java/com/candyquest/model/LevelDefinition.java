package com.candyquest.model;

import jakarta.persistence.*;

@Entity
@Table(name = "level_definitions")
public class LevelDefinition {

    @Id
    private Integer id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 100)
    private String episode;

    @Column(nullable = false, length = 20)
    private String difficulty;

    @Column(nullable = false)
    private Integer moveLimit;

    private Integer timeLimitSeconds;

    @Column(nullable = false)
    private Integer star1Score;

    @Column(nullable = false)
    private Integer star2Score;

    @Column(nullable = false)
    private Integer star3Score;

    @Column(nullable = false, length = 100)
    private String allowedColors;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String objectivesJson;

    @Column(columnDefinition = "TEXT")
    private String layoutJson;

    public LevelDefinition() {}

    public LevelDefinition(Integer id, String name, String episode, String difficulty, 
                           Integer moveLimit, Integer timeLimitSeconds, Integer star1Score, 
                           Integer star2Score, Integer star3Score, String allowedColors, 
                           String objectivesJson, String layoutJson) {
        this.id = id;
        this.name = name;
        this.episode = episode;
        this.difficulty = difficulty;
        this.moveLimit = moveLimit;
        this.timeLimitSeconds = timeLimitSeconds;
        this.star1Score = star1Score;
        this.star2Score = star2Score;
        this.star3Score = star3Score;
        this.allowedColors = allowedColors;
        this.objectivesJson = objectivesJson;
        this.layoutJson = layoutJson;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEpisode() { return episode; }
    public void setEpisode(String episode) { this.episode = episode; }
    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    public Integer getMoveLimit() { return moveLimit; }
    public void setMoveLimit(Integer moveLimit) { this.moveLimit = moveLimit; }
    public Integer getTimeLimitSeconds() { return timeLimitSeconds; }
    public void setTimeLimitSeconds(Integer timeLimitSeconds) { this.timeLimitSeconds = timeLimitSeconds; }
    public Integer getStar1Score() { return star1Score; }
    public void setStar1Score(Integer star1Score) { this.star1Score = star1Score; }
    public Integer getStar2Score() { return star2Score; }
    public void setStar2Score(Integer star2Score) { this.star2Score = star2Score; }
    public Integer getStar3Score() { return star3Score; }
    public void setStar3Score(Integer star3Score) { this.star3Score = star3Score; }
    public String getAllowedColors() { return allowedColors; }
    public void setAllowedColors(String allowedColors) { this.allowedColors = allowedColors; }
    public String getObjectivesJson() { return objectivesJson; }
    public void setObjectivesJson(String objectivesJson) { this.objectivesJson = objectivesJson; }
    public String getLayoutJson() { return layoutJson; }
    public void setLayoutJson(String layoutJson) { this.layoutJson = layoutJson; }
}
