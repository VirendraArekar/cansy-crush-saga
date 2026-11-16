package com.candyquest.controller;

import com.candyquest.model.LevelDefinition;
import com.candyquest.service.LevelService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/levels")
@Tag(name = "Levels", description = "Endpoints for fetching level definitions and objectives")
public class LevelController {

    private final LevelService levelService;

    public LevelController(LevelService levelService) {
        this.levelService = levelService;
    }

    @GetMapping
    @Operation(summary = "Get all 100 level definitions")
    public ResponseEntity<List<LevelDefinition>> getAllLevels() {
        return ResponseEntity.ok(levelService.getAllLevels());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get configuration for a specific level")
    public ResponseEntity<LevelDefinition> getLevelById(@PathVariable Integer id) {
        return ResponseEntity.ok(levelService.getLevelById(id));
    }
}
