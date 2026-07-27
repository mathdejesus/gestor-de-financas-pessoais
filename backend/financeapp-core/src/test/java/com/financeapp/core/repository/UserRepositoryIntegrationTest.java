package com.financeapp.core.repository;

import com.financeapp.core.AbstractPostgresIntegrationTest;
import com.financeapp.core.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

class UserRepositoryIntegrationTest extends AbstractPostgresIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void shouldSaveAndFindUser() {
        User user = User.builder()
                .name("Integration Test")
                .email("integration@test.com")
                .passwordHash("$2a$12$hashedpassword")
                .tokenVersion(0)
                .failedLoginAttempts(0)
                .build();

        User saved = userRepository.save(user);

        assertNotNull(saved.getId());
        assertEquals("Integration Test", saved.getName());
        assertEquals("integration@test.com", saved.getEmail());
        assertEquals(0, saved.getTokenVersion());
    }

    @Test
    void shouldFindByEmail() {
        User user = User.builder()
                .name("Find By Email")
                .email("findbyemail@test.com")
                .passwordHash("$2a$12$hashedpassword")
                .tokenVersion(0)
                .build();
        userRepository.save(user);

        Optional<User> found = userRepository.findByEmail("findbyemail@test.com");

        assertTrue(found.isPresent());
        assertEquals("Find By Email", found.get().getName());
    }

    @Test
    void shouldReturnEmptyWhenEmailNotFound() {
        Optional<User> found = userRepository.findByEmail("nonexistent@test.com");

        assertTrue(found.isEmpty());
    }

    @Test
    void shouldEnforceUniqueEmail() {
        User user1 = User.builder()
                .name("User One")
                .email("unique@test.com")
                .passwordHash("$2a$12$hash1")
                .tokenVersion(0)
                .build();
        userRepository.save(user1);

        User user2 = User.builder()
                .name("User Two")
                .email("unique@test.com")  // same email
                .passwordHash("$2a$12$hash2")
                .tokenVersion(0)
                .build();

        assertThrows(Exception.class, () -> userRepository.save(user2));
    }

    @Test
    void shouldUpdateUser() {
        User user = User.builder()
                .name("Original Name")
                .email("update@test.com")
                .passwordHash("$2a$12$hash")
                .tokenVersion(0)
                .build();
        user = userRepository.save(user);

        user.setName("Updated Name");
        user.setTokenVersion(1);
        User updated = userRepository.save(user);

        assertEquals("Updated Name", updated.getName());
        assertEquals(1, updated.getTokenVersion());
    }

    @Test
    void shouldDeleteUser() {
        User user = User.builder()
                .name("To Delete")
                .email("delete@test.com")
                .passwordHash("$2a$12$hash")
                .tokenVersion(0)
                .build();
        user = userRepository.save(user);

        userRepository.deleteById(user.getId());

        Optional<User> found = userRepository.findById(user.getId());
        assertTrue(found.isEmpty());
    }

    @Test
    void shouldPersistTimestamps() {
        User user = User.builder()
                .name("Timestamps Test")
                .email("timestamps@test.com")
                .passwordHash("$2a$12$hash")
                .tokenVersion(0)
                .build();

        User saved = userRepository.save(user);

        assertNotNull(saved.getCreatedAt());
        assertNotNull(saved.getUpdatedAt());
        assertTrue(saved.getCreatedAt() instanceof LocalDateTime);
    }
}
