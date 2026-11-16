package com.candyquest.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(length = 50)
    private String avatar = "🍭";

    private Integer coins = 500;
    private Integer lives = 5;
    private Integer maxLives = 5;
    private LocalDateTime lastLifeRegen = LocalDateTime.now();
    private Integer unlockedLevel = 1;
    private LocalDateTime createdAt = LocalDateTime.now();

    public User() {}

    public User(Long id, String username, String password, String avatar, Integer coins, 
                Integer lives, Integer maxLives, LocalDateTime lastLifeRegen, 
                Integer unlockedLevel, LocalDateTime createdAt) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.avatar = avatar != null ? avatar : "🍭";
        this.coins = coins != null ? coins : 500;
        this.lives = lives != null ? lives : 5;
        this.maxLives = maxLives != null ? maxLives : 5;
        this.lastLifeRegen = lastLifeRegen != null ? lastLifeRegen : LocalDateTime.now();
        this.unlockedLevel = unlockedLevel != null ? unlockedLevel : 1;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private String username;
        private String password;
        private String avatar = "🍭";
        private Integer coins = 500;
        private Integer lives = 5;
        private Integer maxLives = 5;
        private LocalDateTime lastLifeRegen = LocalDateTime.now();
        private Integer unlockedLevel = 1;
        private LocalDateTime createdAt = LocalDateTime.now();

        public Builder id(Long id) { this.id = id; return this; }
        public Builder username(String username) { this.username = username; return this; }
        public Builder password(String password) { this.password = password; return this; }
        public Builder avatar(String avatar) { this.avatar = avatar; return this; }
        public Builder coins(Integer coins) { this.coins = coins; return this; }
        public Builder lives(Integer lives) { this.lives = lives; return this; }
        public Builder maxLives(Integer maxLives) { this.maxLives = maxLives; return this; }
        public Builder lastLifeRegen(LocalDateTime lastLifeRegen) { this.lastLifeRegen = lastLifeRegen; return this; }
        public Builder unlockedLevel(Integer unlockedLevel) { this.unlockedLevel = unlockedLevel; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public User build() {
            return new User(id, username, password, avatar, coins, lives, maxLives, lastLifeRegen, unlockedLevel, createdAt);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
    public Integer getCoins() { return coins; }
    public void setCoins(Integer coins) { this.coins = coins; }
    public Integer getLives() { return lives; }
    public void setLives(Integer lives) { this.lives = lives; }
    public Integer getMaxLives() { return maxLives; }
    public void setMaxLives(Integer maxLives) { this.maxLives = maxLives; }
    public LocalDateTime getLastLifeRegen() { return lastLifeRegen; }
    public void setLastLifeRegen(LocalDateTime lastLifeRegen) { this.lastLifeRegen = lastLifeRegen; }
    public Integer getUnlockedLevel() { return unlockedLevel; }
    public void setUnlockedLevel(Integer unlockedLevel) { this.unlockedLevel = unlockedLevel; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
