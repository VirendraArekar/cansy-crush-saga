package com.candyquest.repository;

import com.candyquest.model.LeaderboardEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface LeaderboardEntryRepository extends JpaRepository<LeaderboardEntry, Long> {
    List<LeaderboardEntry> findTop50ByPeriodOrderByTotalScoreDesc(String period);
    Optional<LeaderboardEntry> findByUserIdAndPeriod(Long userId, String period);
}
