package com.candyquest.repository;

import com.candyquest.model.LevelProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface LevelProgressRepository extends JpaRepository<LevelProgress, Long> {
    List<LevelProgress> findByUserId(Long userId);
    Optional<LevelProgress> findByUserIdAndLevelId(Long userId, Integer levelId);
}
