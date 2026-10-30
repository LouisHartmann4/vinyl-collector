package org.example.vinyl.controller;

import org.example.vinyl.PriceTrackingService;
import org.example.vinyl.repository.VinylCollectionRepository;
import org.example.vinyl.repository.VinylRecordRepository;
import org.example.vinyl.security.CurrentUser;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api")
public class PriceController {

    private final PriceTrackingService priceTrackingService;
    private final VinylRecordRepository recordRepository;
    private final VinylCollectionRepository collectionRepository;
    private final CurrentUser currentUser;

    public PriceController(PriceTrackingService priceTrackingService, VinylRecordRepository recordRepository,
                           VinylCollectionRepository collectionRepository, CurrentUser currentUser) {
        this.priceTrackingService = priceTrackingService;
        this.recordRepository = recordRepository;
        this.collectionRepository = collectionRepository;
        this.currentUser = currentUser;
    }

    @PostMapping("/prices/refresh")
    public PriceTrackingService.RefreshStatus refresh() {
        priceTrackingService.startRefresh(currentUser.id());
        return priceTrackingService.status(currentUser.id());
    }

    @GetMapping("/prices/refresh")
    public PriceTrackingService.RefreshStatus refreshStatus() {
        return priceTrackingService.status(currentUser.id());
    }

    @GetMapping("/collections/{collectionId}/value-history")
    public PriceTrackingService.ValueHistory valueHistory(@PathVariable Long collectionId) {
        Long id = collectionRepository.findByIdAndOwnerId(collectionId, currentUser.id())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sammlung nicht gefunden"))
                .getId();
        return priceTrackingService.valueHistory(recordRepository.findByCollectionsId(id));
    }
}
