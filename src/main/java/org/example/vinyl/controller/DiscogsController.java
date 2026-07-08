package org.example.vinyl.controller;

import org.example.vinyl.discogs.DiscogsService;
import org.example.vinyl.discogs.DiscogsUnavailableException;
import org.example.vinyl.discogs.dto.DiscogsLookupResult;
import org.example.vinyl.discogs.dto.DiscogsSearchResult;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/discogs")
public class DiscogsController {

    private final DiscogsService discogsService;

    public DiscogsController(DiscogsService discogsService) {
        this.discogsService = discogsService;
    }

    @GetMapping("/search")
    public List<DiscogsSearchResult> search(@RequestParam String barcode) {
        return discogsService.searchByBarcode(barcode);
    }

    @GetMapping("/release/{id}")
    public DiscogsLookupResult release(@PathVariable long id) {
        return discogsService.getRelease(id);
    }

    @ExceptionHandler(DiscogsUnavailableException.class)
    public ResponseEntity<Map<String, String>> handleUnavailable(DiscogsUnavailableException e) {
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body(Map.of("error", e.getMessage()));
    }
}
