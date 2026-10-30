package org.example.vinyl.security;

import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Bremst das Durchprobieren von Passwörtern: nach 5 Fehlversuchen für denselben Namen von derselben
 * Adresse wird die Anmeldung gesperrt, mit jeder weiteren Runde doppelt so lange (1, 2, 4 … max. 30 Minuten).
 * Gezählt wird pro Name und Adresse, damit Fremde ein Konto nicht für den Besitzer aussperren können.
 */
@Service
public class LoginAttemptService {

    private static final int MAX_FAILURES = 5;
    private static final Duration BASE_LOCK = Duration.ofMinutes(1);
    private static final Duration MAX_LOCK = Duration.ofMinutes(30);
    private static final Duration FORGET_AFTER = Duration.ofHours(24);

    private final Map<String, Attempts> attempts = new ConcurrentHashMap<>();

    /** Sekunden bis zur nächsten erlaubten Anmeldung, 0 wenn nicht gesperrt. */
    public long secondsLocked(String username, String address) {
        Attempts a = attempts.get(key(username, address));
        Instant now = Instant.now();
        if (a == null || a.lockedUntil == null || !a.lockedUntil.isAfter(now)) {
            return 0;
        }
        return (Duration.between(now, a.lockedUntil).toMillis() + 999) / 1000;
    }

    public void failed(String username, String address) {
        purgeStale();
        attempts.compute(key(username, address), (k, a) -> {
            Attempts next = a == null ? new Attempts() : a;
            next.failures++;
            next.lastFailure = Instant.now();
            if (next.failures % MAX_FAILURES == 0) {
                long rounds = next.failures / MAX_FAILURES;
                Duration lock = BASE_LOCK.multipliedBy(1L << Math.min(rounds - 1, 5));
                next.lockedUntil = Instant.now().plus(lock.compareTo(MAX_LOCK) > 0 ? MAX_LOCK : lock);
            }
            return next;
        });
    }

    public void succeeded(String username, String address) {
        attempts.remove(key(username, address));
    }

    private void purgeStale() {
        Instant cutoff = Instant.now().minus(FORGET_AFTER);
        attempts.values().removeIf(a -> a.lastFailure.isBefore(cutoff));
    }

    private static String key(String username, String address) {
        return (username == null ? "" : username.trim().toLowerCase()) + "|" + address;
    }

    private static final class Attempts {
        int failures;
        Instant lastFailure = Instant.now();
        Instant lockedUntil;
    }
}
