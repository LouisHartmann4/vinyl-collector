package org.example.vinyl.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

/** Abgewiesene Eingaben bekommen 400 mit einer verständlichen Meldung, ohne interne Details. */
@RestControllerAdvice
public class ApiErrorHandler {

    private static final Map<String, String> FIELD_NAMES = Map.ofEntries(
            Map.entry("artist", "Interpret"),
            Map.entry("title", "Titel"),
            Map.entry("genre", "Genre"),
            Map.entry("releaseYear", "Jahr"),
            Map.entry("format", "Format"),
            Map.entry("condition", "Zustand"),
            Map.entry("notes", "Notizen"),
            Map.entry("barcode", "Barcode"),
            Map.entry("styles", "Styles"),
            Map.entry("country", "Land"),
            Map.entry("tracklist", "Tracklist"),
            Map.entry("coverImageUrl", "Cover-URL"),
            Map.entry("discogsReleaseId", "Discogs-ID"),
            Map.entry("label", "Label"),
            Map.entry("catalogNumber", "Katalognummer"),
            Map.entry("lastKnownPrice", "Marktpreis"),
            Map.entry("lastKnownPriceCurrency", "Währung"),
            Map.entry("purchasePrice", "Kaufpreis"),
            Map.entry("purchaseSource", "Gekauft bei"),
            Map.entry("name", "Name"),
            Map.entry("q", "Suchbegriff"));

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> invalidBody(MethodArgumentNotValidException e) {
        FieldError field = e.getBindingResult().getFieldError();
        return badRequest(field == null ? null : field.getField(), field == null ? null : field.getDefaultMessage());
    }

    @ExceptionHandler(HandlerMethodValidationException.class)
    public ResponseEntity<Map<String, String>> invalidParameter(HandlerMethodValidationException e) {
        var result = e.getParameterValidationResults().stream().findFirst();
        return badRequest(result.map(r -> r.getMethodParameter().getParameterName()).orElse(null),
                result.flatMap(r -> r.getResolvableErrors().stream().findFirst())
                        .map(err -> err.getDefaultMessage()).orElse(null));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, String>> unreadable(HttpMessageNotReadableException e) {
        return ResponseEntity.badRequest().body(Map.of("error", "Die Eingabe hat ein ungültiges Format."));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, String>> typeMismatch(MethodArgumentTypeMismatchException e) {
        return ResponseEntity.badRequest().body(Map.of("error", "Die Adresse enthält einen ungültigen Wert."));
    }

    // Nur die selbst formulierten Gründe gehen an das Frontend, nie interne Fehlertexte
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> status(ResponseStatusException e) {
        String reason = e.getReason() != null ? e.getReason() : "Das hat nicht geklappt.";
        return ResponseEntity.status(e.getStatusCode()).body(Map.of("error", reason));
    }

    private static ResponseEntity<Map<String, String>> badRequest(String field, String message) {
        String label = field == null ? "Eingabe" : FIELD_NAMES.getOrDefault(field, field);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", label + ": " + (message == null ? "ungültig" : message)));
    }
}
