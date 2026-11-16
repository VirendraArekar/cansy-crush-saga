package com.candyquest.repository;

import com.candyquest.model.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    List<Inventory> findByUserId(Long userId);
    Optional<Inventory> findByUserIdAndBoosterType(Long userId, String boosterType);
}
