package com.candyquest.controller;

import com.candyquest.dto.LevelCompleteRequest;
import com.candyquest.dto.UserStatsResponse;
import com.candyquest.security.UserPrincipal;
import com.candyquest.service.GameService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/game")
@Tag(name = "Game Progress", description = "Endpoints for completing levels, recording scores, and player stats")
public class GameController {

    private final GameService gameService;

    public GameController(GameService gameService) {
        this.gameService = gameService;
    }

    @PostMapping("/complete")
    @Operation(summary = "Submit level completion results, award stars, coins, and unlock next level")
    public ResponseEntity<UserStatsResponse> completeLevel(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody LevelCompleteRequest request) {
        return ResponseEntity.ok(gameService.completeLevel(principal.getId(), request));
    }

    @PostMapping("/restart")
    @Operation(summary = "Record level retry or failure, deducting 1 player life")
    public ResponseEntity<UserStatsResponse> restartLevel(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(gameService.failOrRestartLevel(principal.getId()));
    }

    @GetMapping("/stats")
    @Operation(summary = "Retrieve current player game statistics and booster inventory")
    public ResponseEntity<UserStatsResponse> getPlayerStats(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(gameService.getUserStats(principal.getId()));
    }
}
