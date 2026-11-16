package com.candyquest.dto;

public class RewardClaimResponse {
    private boolean success;
    private String message;
    private Integer coinsAdded;
    private Integer livesAdded;
    private Integer newCoinsTotal;
    private Integer newLivesTotal;

    public RewardClaimResponse() {}

    public RewardClaimResponse(boolean success, String message, Integer coinsAdded, Integer livesAdded, Integer newCoinsTotal, Integer newLivesTotal) {
        this.success = success;
        this.message = message;
        this.coinsAdded = coinsAdded;
        this.livesAdded = livesAdded;
        this.newCoinsTotal = newCoinsTotal;
        this.newLivesTotal = newLivesTotal;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private boolean success;
        private String message;
        private Integer coinsAdded;
        private Integer livesAdded;
        private Integer newCoinsTotal;
        private Integer newLivesTotal;

        public Builder success(boolean success) { this.success = success; return this; }
        public Builder message(String message) { this.message = message; return this; }
        public Builder coinsAdded(Integer coinsAdded) { this.coinsAdded = coinsAdded; return this; }
        public Builder livesAdded(Integer livesAdded) { this.livesAdded = livesAdded; return this; }
        public Builder newCoinsTotal(Integer newCoinsTotal) { this.newCoinsTotal = newCoinsTotal; return this; }
        public Builder newLivesTotal(Integer newLivesTotal) { this.newLivesTotal = newLivesTotal; return this; }

        public RewardClaimResponse build() {
            return new RewardClaimResponse(success, message, coinsAdded, livesAdded, newCoinsTotal, newLivesTotal);
        }
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Integer getCoinsAdded() { return coinsAdded; }
    public void setCoinsAdded(Integer coinsAdded) { this.coinsAdded = coinsAdded; }
    public Integer getLivesAdded() { return livesAdded; }
    public void setLivesAdded(Integer livesAdded) { this.livesAdded = livesAdded; }
    public Integer getNewCoinsTotal() { return newCoinsTotal; }
    public void setNewCoinsTotal(Integer newCoinsTotal) { this.newCoinsTotal = newCoinsTotal; }
    public Integer getNewLivesTotal() { return newLivesTotal; }
    public void setNewLivesTotal(Integer newLivesTotal) { this.newLivesTotal = newLivesTotal; }
}
