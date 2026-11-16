package com.candyquest.controller;

import com.candyquest.model.LeaderboardEntry;
import com.candyquest.security.UserPrincipal;
import com.candyquest.service.LeaderboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leaderboard")
@Tag(name = "Leaderboard", description = "Endpoints for global, weekly, and friend competition rankings")
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    public LeaderboardController(LeaderboardService leaderboardService) {
        this.leaderboardService = leaderboardService;
    }

    @GetMapping("/global")
    @Operation(summary = "Get top players on the Global leaderboard")
    public ResponseEntity<List<LeaderboardEntry>> getGlobal() {
        return ResponseEntity.ok(leaderboardService.getGlobalLeaderboard());
    }

    @GetMapping("/weekly")
    @Operation(summary = "Get top players on the Weekly competition leaderboard")
    public ResponseEntity<List<LeaderboardEntry>> getWeekly() {
        return ResponseEntity.ok(leaderboardService.getWeeklyLeaderboard());
    }

    @PostMapping("/friends/send-life")
    @Operation(summary = "Send a free life to a friend")
    public ResponseEntity<Map<String, Object>> sendLife(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam Long friendId) {
        boolean sent = leaderboardService.sendLifeToFriend(principal.getId(), friendId);
        return ResponseEntity.ok(Map.of("success", sent, "message", sent ? "Life sent to friend!" : "Failed to send life"));
    }
}
