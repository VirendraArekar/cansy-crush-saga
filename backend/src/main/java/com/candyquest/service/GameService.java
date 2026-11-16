package com.candyquest.service;

import com.candyquest.dto.LevelCompleteRequest;
import com.candyquest.dto.UserStatsResponse;
import com.candyquest.model.*;
import com.candyquest.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GameService {

    private final UserRepository userRepository;
    private final LevelProgressRepository levelProgressRepository;
    private final InventoryRepository inventoryRepository;
    private final LeaderboardEntryRepository leaderboardRepository;

    public GameService(UserRepository userRepository,
                       LevelProgressRepository levelProgressRepository,
                       InventoryRepository inventoryRepository,
                       LeaderboardEntryRepository leaderboardRepository) {
        this.userRepository = userRepository;
        this.levelProgressRepository = levelProgressRepository;
        this.inventoryRepository = inventoryRepository;
        this.leaderboardRepository = leaderboardRepository;
    }

    @Transactional
    public UserStatsResponse completeLevel(Long userId, LevelCompleteRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        LevelProgress progress = levelProgressRepository.findByUserIdAndLevelId(userId, request.getLevelId())
                .orElse(LevelProgress.builder()
                        .userId(userId)
                        .levelId(request.getLevelId())
                        .build());

        progress.setScore(Math.max(progress.getScore(), request.getScore()));
        progress.setStars(Math.max(progress.getStars(), request.getStars()));
        progress.setCompleted(true);
        progress.setCompletedAt(LocalDateTime.now());
        levelProgressRepository.save(progress);

        int earnedCoins = 100 + request.getStars() * 50;
        user.setCoins(user.getCoins() + earnedCoins);
        if (request.getLevelId() >= user.getUnlockedLevel()) {
            user.setUnlockedLevel(request.getLevelId() + 1);
        }
        userRepository.save(user);

        updateUserLeaderboardEntry(user);

        return getUserStats(userId);
    }

    @Transactional
    public UserStatsResponse failOrRestartLevel(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getLives() > 0) {
            user.setLives(user.getLives() - 1);
            userRepository.save(user);
        }

        return getUserStats(userId);
    }

    public UserStatsResponse getUserStats(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<LevelProgress> allProgress = levelProgressRepository.findByUserId(userId);
        int totalStars = allProgress.stream().mapToInt(LevelProgress::getStars).sum();
        long totalScore = allProgress.stream().mapToLong(LevelProgress::getScore).sum();

        List<Inventory> inventories = inventoryRepository.findByUserId(userId);
        Map<String, Integer> boosterMap = new HashMap<>();
        for (Inventory inv : inventories) {
            boosterMap.put(inv.getBoosterType(), inv.getQuantity());
        }

        return UserStatsResponse.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .avatar(user.getAvatar())
                .coins(user.getCoins())
                .lives(user.getLives())
                .maxLives(user.getMaxLives())
                .unlockedLevel(user.getUnlockedLevel())
                .totalStars(totalStars)
                .totalScore(totalScore)
                .boosters(boosterMap)
                .build();
    }

    private void updateUserLeaderboardEntry(User user) {
        List<LevelProgress> allProgress = levelProgressRepository.findByUserId(user.getId());
        int totalStars = allProgress.stream().mapToInt(LevelProgress::getStars).sum();
        long totalScore = allProgress.stream().mapToLong(LevelProgress::getScore).sum();

        LeaderboardEntry entry = leaderboardRepository.findByUserIdAndPeriod(user.getId(), "GLOBAL")
                .orElse(LeaderboardEntry.builder()
                        .userId(user.getId())
                        .username(user.getUsername())
                        .avatar(user.getAvatar())
                        .period("GLOBAL")
                        .build());

        entry.setTotalScore(totalScore);
        entry.setTotalStars(totalStars);
        entry.setHighestLevel(user.getUnlockedLevel());
        leaderboardRepository.save(entry);
    }
}
