package com.candyquest.service;

import com.candyquest.model.LevelDefinition;
import com.candyquest.repository.LevelDefinitionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LevelService {

    private final LevelDefinitionRepository levelRepository;

    public LevelService(LevelDefinitionRepository levelRepository) {
        this.levelRepository = levelRepository;
    }

    public List<LevelDefinition> getAllLevels() {
        return levelRepository.findAllByOrderByIdAsc();
    }

    public LevelDefinition getLevelById(Integer levelId) {
        return levelRepository.findById(levelId)
                .orElseThrow(() -> new IllegalArgumentException("Level " + levelId + " not found"));
    }
}
