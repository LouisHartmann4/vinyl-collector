package org.example.vinyl.controller;

import org.example.vinyl.model.VinylCollection;
import org.example.vinyl.model.VinylRecord;
import org.example.vinyl.repository.VinylCollectionRepository;
import org.example.vinyl.repository.VinylRecordRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api/collections")
public class VinylCollectionController {

    private final VinylCollectionRepository collectionRepository;
    private final VinylRecordRepository recordRepository;

    public VinylCollectionController(VinylCollectionRepository collectionRepository, VinylRecordRepository recordRepository) {
        this.collectionRepository = collectionRepository;
        this.recordRepository = recordRepository;
    }

    @GetMapping
    public List<CollectionSummary> getAll() {
        return collectionRepository.findAll().stream()
                .sorted(Comparator.comparing(c -> !c.isGeneral()))
                .map(c -> new CollectionSummary(c.getId(), c.getName(),
                        recordRepository.countByCollectionsId(c.getId()), !c.isGeneral()))
                .toList();
    }

    @PostMapping
    public VinylCollection create(@RequestBody VinylCollection collection) {
        collection.setId(null);
        collection.setGeneral(false);
        return collectionRepository.save(collection);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        VinylCollection collection = collectionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sammlung nicht gefunden"));
        if (collection.isGeneral()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Diese Sammlung kann nicht gelöscht werden");
        }

        List<VinylRecord> records = recordRepository.findByCollectionsId(id);
        for (VinylRecord record : records) {
            record.getCollections().remove(collection);
        }
        recordRepository.saveAll(records);

        collectionRepository.deleteById(id);
    }

    public record CollectionSummary(Long id, String name, long recordCount, boolean deletable) {
    }
}
