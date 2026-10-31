package org.example.vinyl.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "app_user")
public class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // immer klein geschrieben gespeichert, damit "Louis" und "louis" dasselbe Konto sind
    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String passwordHash;

    // zufällige, öffentliche Kennung für die Adresse; die interne Zahl-ID bleibt verborgen
    @Column(unique = true, length = 36)
    private String publicId;

    private Instant createdAt;

    public AppUser() {
    }

    public AppUser(String username, String passwordHash) {
        this.username = username;
        this.passwordHash = passwordHash;
        this.publicId = UUID.randomUUID().toString();
        this.createdAt = Instant.now();
    }

    /** Vergibt Konten aus der Zeit vor den UUIDs eine; true, wenn eine neue vergeben wurde. */
    public boolean ensurePublicId() {
        if (publicId != null) {
            return false;
        }
        publicId = UUID.randomUUID().toString();
        return true;
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getPublicId() {
        return publicId;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
