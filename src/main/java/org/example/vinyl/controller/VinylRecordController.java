package org.example.vinyl.controller;

import org.example.vinyl.model.VinylCollection;
import org.example.vinyl.model.VinylRecord;
import org.example.vinyl.repository.VinylCollectionRepository;
import org.example.vinyl.repository.VinylRecordRepository;
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

    public VinylRecordController(VinylRecordRepository repository, VinylCollectionRepository collectionRepository) {
        this.repository = repository;
        this.collectionRepository = collectionRepository;
    }

    @GetMapping
    public List<VinylRecord> getAll(@PathVariable Long collectionId) {
        return repository.findByCollectionsId(collectionId);
    }

    @PostMapping
    public VinylRecord create(@PathVariable Long collectionId, @RequestBody VinylRecord record) {
        record.setId(null);
        record.getCollections().clear();
        record.getCollections().addAll(targetCollections(collectionId));
        return repository.save(record);
    }

    @PutMapping("/{id}")
    public VinylRecord update(@PathVariable Long collectionId, @PathVariable Long id, @RequestBody VinylRecord record) {
        record.setId(id);
        record.getCollections().clear();
        record.getCollections().addAll(targetCollections(collectionId));
        return repository.save(record);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long collectionId, @PathVariable Long id) {
        repository.deleteById(id);
    }

    @DeleteMapping
    public void deleteAll(@PathVariable Long collectionId) {
        VinylCollection collection = requireCollection(collectionId);
        if (collection.isGeneral()) {
            repository.deleteAll();
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

        VinylCollection general = collectionRepository.findAll().stream()
                .filter(VinylCollection::isGeneral)
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Allgemein-Sammlung fehlt"));

        HashSet<VinylCollection> target = new HashSet<>();
        target.add(collection);
        target.add(general);
        return target;
    }

    private VinylCollection requireCollection(Long collectionId) {
        return collectionRepository.findById(collectionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sammlung nicht gefunden"));
    }
}
