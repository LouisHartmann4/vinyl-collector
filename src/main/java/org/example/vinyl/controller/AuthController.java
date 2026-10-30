package org.example.vinyl.controller;

import org.example.vinyl.security.AppUserPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/** Es gibt keine Registrierung: die Konten sind fest angelegt (louis, admin, marcus). */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @GetMapping("/me")
    public Me me(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof AppUserPrincipal principal) {
            return new Me(true, principal.getUsername());
        }
        return new Me(false, null);
    }

    public record Me(boolean authenticated, String username) {
    }
}
