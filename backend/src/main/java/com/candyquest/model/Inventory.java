package com.candyquest.model;

import jakarta.persistence.*;

@Entity
@Table(name = "inventories", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "booster_type"})
})
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "booster_type", nullable = false, length = 50)
    private String boosterType;

    private Integer quantity = 0;

    public Inventory() {}

    public Inventory(Long id, Long userId, String boosterType, Integer quantity) {
        this.id = id;
        this.userId = userId;
        this.boosterType = boosterType;
        this.quantity = quantity != null ? quantity : 0;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private Long userId;
        private String boosterType;
        private Integer quantity = 0;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder userId(Long userId) { this.userId = userId; return this; }
        public Builder boosterType(String boosterType) { this.boosterType = boosterType; return this; }
        public Builder quantity(Integer quantity) { this.quantity = quantity; return this; }

        public Inventory build() {
            return new Inventory(id, userId, boosterType, quantity);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getBoosterType() { return boosterType; }
    public void setBoosterType(String boosterType) { this.boosterType = boosterType; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
}
