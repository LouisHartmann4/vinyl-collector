package org.example.vinyl.controller;

import org.example.vinyl.security.AppUserPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * Die Adresse zeigt statt eines Pfads nur die UUID des angemeldeten Kontos, z. B. /7c9e6679-….
 * Die UUID ist kein Geheimnis und öffnet nichts: Zugriff gibt allein das Session-Cookie.
 */
@Controller
public class SessionUrlController {

    @GetMapping("/")
    public String home(@AuthenticationPrincipal AppUserPrincipal user) {
        return "redirect:/" + user.getPublicId();
    }

    @GetMapping("/{publicId:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}}")
    public String app(@PathVariable String publicId, @AuthenticationPrincipal AppUserPrincipal user) {
        // fremde UUID: auf die eigene umleiten, gezeigt werden immer nur die eigenen Daten
        return publicId.equals(user.getPublicId()) ? "forward:/index.html" : "redirect:/" + user.getPublicId();
    }
}
