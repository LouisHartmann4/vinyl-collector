package org.example.vinyl.controller;

import org.example.vinyl.discogs.DiscogsService;
import org.example.vinyl.discogs.DiscogsUnavailableException;
import org.example.vinyl.discogs.dto.DiscogsLookupResult;
import org.example.vinyl.discogs.dto.DiscogsMarketStats;
import org.example.vinyl.model.WishlistItem;
import org.example.vinyl.repository.WishlistItemRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistItemRepository repository;
    private final DiscogsService discogsService;

    public WishlistController(WishlistItemRepository repository, DiscogsService discogsService) {
        this.repository = repository;
        this.discogsService = discogsService;
    }

    @GetMapping
    public List<WishlistItem> getAll() {
        return repository.findAll();
    }

    @PostMapping("/{releaseId}")
    public WishlistItem add(@PathVariable long releaseId) {
        if (repository.existsByDiscogsReleaseId(releaseId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Bereits auf der Wunschliste");
        }

        DiscogsLookupResult release = discogsService.getRelease(releaseId);
        if (release == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Discogs-Release nicht gefunden");
        }

        WishlistItem item = new WishlistItem();
        item.setArtist(release.artist());
        item.setTitle(release.title());
        item.setReleaseYear(release.releaseYear());
        item.setFormat(release.format());
        item.setCatalogNumber(release.catalogNumber());
        item.setCoverImageUrl(release.coverImageUrl());
        item.setDiscogsReleaseId(releaseId);

        try {
            DiscogsMarketStats stats = discogsService.getMarketStats(releaseId);
            if (stats != null && stats.lowestPrice() != null) {
                item.setLastKnownPrice(stats.lowestPrice());
                item.setLastKnownPriceCurrency(stats.currency());
            }
        } catch (DiscogsUnavailableException e) {
            // Preis bleibt unbekannt, Eintrag wird trotzdem angelegt
        }

        return repository.save(item);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }
}
