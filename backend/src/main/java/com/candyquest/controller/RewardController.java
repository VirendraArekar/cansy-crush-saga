package com.candyquest.controller;

import com.candyquest.dto.RewardClaimResponse;
import com.candyquest.model.User;
import com.candyquest.security.UserPrincipal;
import com.candyquest.service.RewardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rewards")
@Tag(name = "Rewards", description = "Endpoints for daily bonuses, lives regeneration, and rewarded ads")
public class RewardController {

    private final RewardService rewardService;

    public RewardController(RewardService rewardService) {
        this.rewardService = rewardService;
    }

    @PostMapping("/daily")
    @Operation(summary = "Claim daily login bonus coins and lives")
    public ResponseEntity<RewardClaimResponse> claimDaily(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(rewardService.claimDailyReward(principal.getId()));
    }

    @PostMapping("/admob")
    @Operation(summary = "Grant rewards after viewing a Google AdMob rewarded advertisement")
    public ResponseEntity<RewardClaimResponse> claimAdReward(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "MOVES") String type) {
        return ResponseEntity.ok(rewardService.claimAdReward(principal.getId(), type));
    }

    @GetMapping("/lives/sync")
    @Operation(summary = "Sync and regenerate lives based on time elapsed")
    public ResponseEntity<User> syncLives(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(rewardService.checkAndRegenerateLives(principal.getId()));
    }
}
