package org.example.vinyl.security;

import org.example.vinyl.model.AppUser;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.io.Serializable;
import java.util.Collection;
import java.util.List;

/** Angemeldetes Konto in der Session; trägt die ID, damit Abfragen nach Besitzer filtern können. */
public class AppUserPrincipal implements UserDetails, Serializable {

    private final Long id;
    private final String publicId;
    private final String username;
    private final String passwordHash;

    public AppUserPrincipal(AppUser user) {
        this.id = user.getId();
        this.publicId = user.getPublicId();
        this.username = user.getUsername();
        this.passwordHash = user.getPasswordHash();
    }

    public Long getId() {
        return id;
    }

    public String getPublicId() {
        return publicId;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }
}
