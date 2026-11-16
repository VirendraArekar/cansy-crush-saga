package com.candyquest.service;

import com.candyquest.dto.AuthRequest;
import com.candyquest.dto.AuthResponse;
import com.candyquest.model.Inventory;
import com.candyquest.model.User;
import com.candyquest.repository.InventoryRepository;
import com.candyquest.repository.UserRepository;
import com.candyquest.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final InventoryRepository inventoryRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UserRepository userRepository, 
                       InventoryRepository inventoryRepository, 
                       PasswordEncoder passwordEncoder, 
                       JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.inventoryRepository = inventoryRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public AuthResponse register(AuthRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username is already taken");
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .avatar("🍭")
                .coins(600)
                .lives(5)
                .maxLives(5)
                .lastLifeRegen(LocalDateTime.now())
                .unlockedLevel(1)
                .build();

        user = userRepository.save(user);

        // Seed default starter boosters
        String[] defaultBoosters = {"LOLLIPOP_HAMMER", "FREE_SWITCH", "COLOR_BOMB", "STRIPED_BRUSH", "SHUFFLE", "EXTRA_MOVES"};
        for (String b : defaultBoosters) {
            inventoryRepository.save(Inventory.builder()
                    .userId(user.getId())
                    .boosterType(b)
                    .quantity(3)
                    .build());
        }

        String token = tokenProvider.generateToken(user.getUsername(), user.getId());

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .username(user.getUsername())
                .avatar(user.getAvatar())
                .coins(user.getCoins())
                .lives(user.getLives())
                .unlockedLevel(user.getUnlockedLevel())
                .build();
    }

    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid username or password");
        }

        String token = tokenProvider.generateToken(user.getUsername(), user.getId());

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .username(user.getUsername())
                .avatar(user.getAvatar())
                .coins(user.getCoins())
                .lives(user.getLives())
                .unlockedLevel(user.getUnlockedLevel())
                .build();
    }

    public AuthResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return AuthResponse.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .avatar(user.getAvatar())
                .coins(user.getCoins())
                .lives(user.getLives())
                .unlockedLevel(user.getUnlockedLevel())
                .build();
    }
}
