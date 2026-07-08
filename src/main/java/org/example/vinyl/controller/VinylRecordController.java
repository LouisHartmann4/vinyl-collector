package org.example.vinyl.controller;

import org.example.vinyl.model.VinylRecord;
import org.example.vinyl.repository.VinylRecordRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/records")
public class VinylRecordController {

    private final VinylRecordRepository repository;

    public VinylRecordController(VinylRecordRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<VinylRecord> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public VinylRecord create(@RequestBody VinylRecord record) {
        record.setId(null);
        return repository.save(record);
    }

    @PutMapping("/{id}")
    public VinylRecord update(@PathVariable Long id, @RequestBody VinylRecord record) {
        record.setId(id);
        return repository.save(record);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }

    @DeleteMapping
    public void deleteAll() {
        repository.deleteAll();
    }
}
