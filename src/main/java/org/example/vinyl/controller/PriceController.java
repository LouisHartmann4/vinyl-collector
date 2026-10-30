package org.example.vinyl.controller;

import org.example.vinyl.PriceTrackingService;
import org.example.vinyl.repository.VinylRecordRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class PriceController {

    private final PriceTrackingService priceTrackingService;
    private final VinylRecordRepository recordRepository;

    public PriceController(PriceTrackingService priceTrackingService, VinylRecordRepository recordRepository) {
        this.priceTrackingService = priceTrackingService;
        this.recordRepository = recordRepository;
    }

    @PostMapping("/prices/refresh")
    public PriceTrackingService.RefreshStatus refresh() {
        priceTrackingService.startRefresh();
        return priceTrackingService.status();
    }

    @GetMapping("/prices/refresh")
    public PriceTrackingService.RefreshStatus refreshStatus() {
        return priceTrackingService.status();
    }

    @GetMapping("/collections/{collectionId}/value-history")
    public PriceTrackingService.ValueHistory valueHistory(@PathVariable Long collectionId) {
        return priceTrackingService.valueHistory(recordRepository.findByCollectionsId(collectionId));
    }
}
