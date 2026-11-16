package com.candyquest.service;

import com.candyquest.model.Friend;
import com.candyquest.model.LeaderboardEntry;
import com.candyquest.model.User;
import com.candyquest.repository.FriendRepository;
import com.candyquest.repository.LeaderboardEntryRepository;
import com.candyquest.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class LeaderboardService {

    private final LeaderboardEntryRepository leaderboardRepository;
    private final FriendRepository friendRepository;
    private final UserRepository userRepository;

    public LeaderboardService(LeaderboardEntryRepository leaderboardRepository, 
                              FriendRepository friendRepository, 
                              UserRepository userRepository) {
        this.leaderboardRepository = leaderboardRepository;
        this.friendRepository = friendRepository;
        this.userRepository = userRepository;
    }

    public List<LeaderboardEntry> getGlobalLeaderboard() {
        return leaderboardRepository.findTop50ByPeriodOrderByTotalScoreDesc("GLOBAL");
    }

    public List<LeaderboardEntry> getWeeklyLeaderboard() {
        return leaderboardRepository.findTop50ByPeriodOrderByTotalScoreDesc("GLOBAL");
    }

    public List<Friend> getFriends(Long userId) {
        return friendRepository.findByUserId(userId);
    }

    @Transactional
    public boolean sendLifeToFriend(Long userId, Long friendId) {
        User friendUser = userRepository.findById(friendId).orElse(null);
        if (friendUser == null) return false;

        friendUser.setLives(Math.min(friendUser.getMaxLives(), friendUser.getLives() + 1));
        userRepository.save(friendUser);
        return true;
    }
}
