package org.example.vinyl.controller;

import org.example.vinyl.AccountService;
import org.example.vinyl.PriceTrackingService;
import org.example.vinyl.discogs.DiscogsService;
import org.example.vinyl.discogs.DiscogsUnavailableException;
import org.example.vinyl.discogs.dto.DiscogsMarketStats;
import org.example.vinyl.model.VinylCollection;
import org.example.vinyl.model.VinylRecord;
import org.example.vinyl.repository.PriceSnapshotRepository;
import org.example.vinyl.repository.VinylCollectionRepository;
import org.example.vinyl.repository.VinylRecordRepository;
import org.example.vinyl.security.CurrentUser;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashSet;
import java.util.List;

@RestController
@RequestMapping("/api/collections/{collectionId}/records")
public class VinylRecordController {

    private final VinylRecordRepository repository;
    private final VinylCollectionRepository collectionRepository;
    private final DiscogsService discogsService;
    private final PriceTrackingService priceTrackingService;
    private final PriceSnapshotRepository snapshotRepository;
    private final AccountService accountService;
    private final CurrentUser currentUser;

    public VinylRecordController(VinylRecordRepository repository, VinylCollectionRepository collectionRepository,
                                  DiscogsService discogsService, PriceTrackingService priceTrackingService,
                                  PriceSnapshotRepository snapshotRepository, AccountService accountService,
                                  CurrentUser currentUser) {
        this.repository = repository;
        this.collectionRepository = collectionRepository;
        this.discogsService = discogsService;
        this.priceTrackingService = priceTrackingService;
        this.snapshotRepository = snapshotRepository;
        this.accountService = accountService;
        this.currentUser = currentUser;
    }

    @GetMapping
    public List<VinylRecord> getAll(@PathVariable Long collectionId) {
        return repository.findByCollectionsId(requireCollection(collectionId).getId());
    }

    @PostMapping
    public VinylRecord create(@PathVariable Long collectionId, @RequestBody VinylRecord record) {
        record.setId(null);
        record.setOwnerId(currentUser.id());
        record.getCollections().clear();
        record.getCollections().addAll(targetCollections(collectionId));
        fetchLatestPrice(record);
        VinylRecord saved = repository.save(record);
        priceTrackingService.recordSnapshot(saved);
        return saved;
    }

    @PutMapping("/{id}")
    public VinylRecord update(@PathVariable Long collectionId, @PathVariable Long id, @RequestBody VinylRecord record) {
        requireRecord(id);
        record.setId(id);
        record.setOwnerId(currentUser.id());
        record.getCollections().clear();
        record.getCollections().addAll(targetCollections(collectionId));
        fetchLatestPrice(record);
        VinylRecord saved = repository.save(record);
        priceTrackingService.recordSnapshot(saved);
        return saved;
    }

    private void fetchLatestPrice(VinylRecord record) {
        if (record.getDiscogsReleaseId() == null) {
            return;
        }
        try {
            DiscogsMarketStats stats = discogsService.getMarketStats(record.getDiscogsReleaseId());
            if (stats != null && stats.lowestPrice() != null) {
                record.setLastKnownPrice(stats.lowestPrice());
                record.setLastKnownPriceCurrency(stats.currency());
            }
        } catch (DiscogsUnavailableException e) {
            // Preis bleibt unbekannt, Speichern wird dadurch nicht blockiert
        }
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long collectionId, @PathVariable Long id) {
        repository.delete(requireRecord(id));
        snapshotRepository.deleteByRecordId(id);
    }

    @DeleteMapping
    public void deleteAll(@PathVariable Long collectionId) {
        VinylCollection collection = requireCollection(collectionId);
        if (collection.isGeneral()) {
            List<VinylRecord> own = repository.findByOwnerId(currentUser.id());
            repository.deleteAll(own);
            snapshotRepository.deleteByRecordIdIn(own.stream().map(VinylRecord::getId).toList());
            return;
        }

        List<VinylRecord> records = repository.findByCollectionsId(collectionId);
        for (VinylRecord record : records) {
            record.getCollections().remove(collection);
        }
        repository.saveAll(records);
    }

    private HashSet<VinylCollection> targetCollections(Long collectionId) {
        VinylCollection collection = requireCollection(collectionId);
        if (collection.isGeneral()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bitte eine konkrete Sammlung wählen");
        }

        VinylCollection general = accountService.ensureGeneralCollection(currentUser.id());

        HashSet<VinylCollection> target = new HashSet<>();
        target.add(collection);
        target.add(general);
        return target;
    }

    private VinylRecord requireRecord(Long id) {
        return repository.findByIdAndOwnerId(id, currentUser.id())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Platte nicht gefunden"));
    }

    private VinylCollection requireCollection(Long collectionId) {
        return collectionRepository.findByIdAndOwnerId(collectionId, currentUser.id())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sammlung nicht gefunden"));
    }
}
