package com.candyquest.repository;

import com.candyquest.model.LevelDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LevelDefinitionRepository extends JpaRepository<LevelDefinition, Integer> {
    List<LevelDefinition> findAllByOrderByIdAsc();
}
