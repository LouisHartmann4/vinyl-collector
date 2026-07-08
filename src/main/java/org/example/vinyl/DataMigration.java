package org.example.vinyl;

import org.example.vinyl.model.VinylCollection;
import org.example.vinyl.model.VinylRecord;
import org.example.vinyl.repository.VinylCollectionRepository;
import org.example.vinyl.repository.VinylRecordRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataMigration implements CommandLineRunner {

    private final VinylCollectionRepository collectionRepository;
    private final VinylRecordRepository recordRepository;

    public DataMigration(VinylCollectionRepository collectionRepository, VinylRecordRepository recordRepository) {
        this.collectionRepository = collectionRepository;
        this.recordRepository = recordRepository;
    }

    @Override
    public void run(String... args) {
        VinylCollection general = collectionRepository.findAll().stream()
                .filter(VinylCollection::isGeneral)
                .findFirst()
                .orElseGet(() -> {
                    VinylCollection c = new VinylCollection();
                    c.setName("Alle Platten");
                    c.setGeneral(true);
                    return collectionRepository.save(c);
                });

        List<VinylRecord> unassigned = recordRepository.findByCollectionsIsEmpty();
        if (unassigned.isEmpty()) {
            return;
        }

        VinylCollection defaultCollection = new VinylCollection();
        defaultCollection.setName("Meine Sammlung");
        defaultCollection = collectionRepository.save(defaultCollection);

        for (VinylRecord record : unassigned) {
            record.getCollections().add(defaultCollection);
            record.getCollections().add(general);
        }
        recordRepository.saveAll(unassigned);
    }
}
