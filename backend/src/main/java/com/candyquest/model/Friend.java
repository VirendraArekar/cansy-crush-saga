package com.candyquest.model;

import jakarta.persistence.*;

@Entity
@Table(name = "friends")
public class Friend {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "friend_id", nullable = false)
    private Long friendId;

    private String status = "ACCEPTED";
    private Boolean livesSentToday = false;

    public Friend() {}

    public Friend(Long id, Long userId, Long friendId, String status, Boolean livesSentToday) {
        this.id = id;
        this.userId = userId;
        this.friendId = friendId;
        this.status = status != null ? status : "ACCEPTED";
        this.livesSentToday = livesSentToday != null ? livesSentToday : false;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private Long userId;
        private Long friendId;
        private String status = "ACCEPTED";
        private Boolean livesSentToday = false;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder userId(Long userId) { this.userId = userId; return this; }
        public Builder friendId(Long friendId) { this.friendId = friendId; return this; }
        public Builder status(String status) { this.status = status; return this; }
        public Builder livesSentToday(Boolean livesSentToday) { this.livesSentToday = livesSentToday; return this; }

        public Friend build() {
            return new Friend(id, userId, friendId, status, livesSentToday);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getFriendId() { return friendId; }
    public void setFriendId(Long friendId) { this.friendId = friendId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Boolean getLivesSentToday() { return livesSentToday; }
    public void setLivesSentToday(Boolean livesSentToday) { this.livesSentToday = livesSentToday; }
}
