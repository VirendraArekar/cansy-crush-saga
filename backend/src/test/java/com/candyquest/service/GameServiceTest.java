package com.candyquest.service;

import com.candyquest.dto.LevelCompleteRequest;
import com.candyquest.dto.UserStatsResponse;
import com.candyquest.model.User;
import com.candyquest.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GameServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private LevelProgressRepository levelProgressRepository;

    @Mock
    private InventoryRepository inventoryRepository;

    @Mock
    private LeaderboardEntryRepository leaderboardRepository;

    @InjectMocks
    private GameService gameService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .username("PlayerOne")
                .coins(500)
                .lives(5)
                .maxLives(5)
                .unlockedLevel(1)
                .build();
    }

    @Test
    void testCompleteLevelUnlocksNextLevelAndAwardsCoins() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(levelProgressRepository.findByUserIdAndLevelId(1L, 1)).thenReturn(Optional.empty());
        when(levelProgressRepository.findByUserId(1L)).thenReturn(Collections.emptyList());
        when(inventoryRepository.findByUserId(1L)).thenReturn(Collections.emptyList());
        when(leaderboardRepository.findByUserIdAndPeriod(1L, "GLOBAL")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        LevelCompleteRequest request = new LevelCompleteRequest(1, 15000, 3, 5);
        UserStatsResponse response = gameService.completeLevel(1L, request);

        assertNotNull(response);
        assertEquals(2, testUser.getUnlockedLevel());
        assertTrue(testUser.getCoins() > 500);
        verify(userRepository, times(1)).save(testUser);
        verify(levelProgressRepository, times(1)).save(any());
    }

    @Test
    void testFailOrRestartLevelDeductsOneLife() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(levelProgressRepository.findByUserId(1L)).thenReturn(Collections.emptyList());
        when(inventoryRepository.findByUserId(1L)).thenReturn(Collections.emptyList());
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        UserStatsResponse response = gameService.failOrRestartLevel(1L);

        assertNotNull(response);
        assertEquals(4, testUser.getLives());
        verify(userRepository, times(1)).save(testUser);
    }
}
