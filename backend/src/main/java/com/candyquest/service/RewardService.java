package com.candyquest.service;

import com.candyquest.dto.RewardClaimResponse;
import com.candyquest.model.Inventory;
import com.candyquest.model.User;
import com.candyquest.repository.InventoryRepository;
import com.candyquest.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
public class RewardService {

    private final UserRepository userRepository;
    private final InventoryRepository inventoryRepository;

    @Value("${app.rewards.daily-login-coins:250}")
    private int dailyCoins;

    @Value("${app.rewards.daily-login-lives:2}")
    private int dailyLives;

    @Value("${app.rewards.life-regen-interval-minutes:30}")
    private int regenMinutes;

    public RewardService(UserRepository userRepository, InventoryRepository inventoryRepository) {
        this.userRepository = userRepository;
        this.inventoryRepository = inventoryRepository;
    }

    @Transactional
    public RewardClaimResponse claimDailyReward(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setCoins(user.getCoins() + dailyCoins);
        user.setLives(Math.min(user.getMaxLives(), user.getLives() + dailyLives));
        userRepository.save(user);

        return RewardClaimResponse.builder()
                .success(true)
                .message("Daily bonus reward claimed successfully!")
                .coinsAdded(dailyCoins)
                .livesAdded(dailyLives)
                .newCoinsTotal(user.getCoins())
                .newLivesTotal(user.getLives())
                .build();
    }

    @Transactional
    public RewardClaimResponse claimAdReward(Long userId, String rewardType) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        int coinsAdded = 0;
        int livesAdded = 0;

        if ("LIVES".equalsIgnoreCase(rewardType)) {
            livesAdded = 1;
            user.setLives(Math.min(user.getMaxLives(), user.getLives() + 1));
        } else if ("COINS".equalsIgnoreCase(rewardType)) {
            coinsAdded = 150;
            user.setCoins(user.getCoins() + 150);
        } else if ("BOOSTER".equalsIgnoreCase(rewardType)) {
            Inventory inv = inventoryRepository.findByUserIdAndBoosterType(userId, "COLOR_BOMB")
                    .orElse(Inventory.builder().userId(userId).boosterType("COLOR_BOMB").quantity(0).build());
            inv.setQuantity(inv.getQuantity() + 1);
            inventoryRepository.save(inv);
        }

        userRepository.save(user);

        return RewardClaimResponse.builder()
                .success(true)
                .message("AdMob rewarded bonus granted!")
                .coinsAdded(coinsAdded)
                .livesAdded(livesAdded)
                .newCoinsTotal(user.getCoins())
                .newLivesTotal(user.getLives())
                .build();
    }

    @Transactional
    public User checkAndRegenerateLives(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getLives() >= user.getMaxLives()) {
            return user;
        }

        LocalDateTime now = LocalDateTime.now();
        Duration elapsed = Duration.between(user.getLastLifeRegen(), now);
        long intervals = elapsed.toMinutes() / regenMinutes;

        if (intervals > 0) {
            int newLives = (int) Math.min(user.getMaxLives(), user.getLives() + intervals);
            user.setLives(newLives);
            if (newLives >= user.getMaxLives()) {
                user.setLastLifeRegen(now);
            } else {
                user.setLastLifeRegen(user.getLastLifeRegen().plusMinutes(intervals * regenMinutes));
            }
            userRepository.save(user);
        }

        return user;
    }
}
