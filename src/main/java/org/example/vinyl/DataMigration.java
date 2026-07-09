package org.example.vinyl;

import org.example.vinyl.discogs.DiscogsService;
import org.example.vinyl.discogs.DiscogsUnavailableException;
import org.example.vinyl.discogs.dto.DiscogsMarketStats;
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
    private final DiscogsService discogsService;

    public DataMigration(VinylCollectionRepository collectionRepository, VinylRecordRepository recordRepository,
                          DiscogsService discogsService) {
        this.collectionRepository = collectionRepository;
        this.recordRepository = recordRepository;
        this.discogsService = discogsService;
    }

    @Override
    public void run(String... args) {
        assignOrphanRecords();
        backfillMissingPrices();
    }

    private void assignOrphanRecords() {
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

    private void backfillMissingPrices() {
        List<VinylRecord> missingPrice = recordRepository.findByDiscogsReleaseIdIsNotNullAndLastKnownPriceIsNull();
        for (VinylRecord record : missingPrice) {
            try {
                DiscogsMarketStats stats = discogsService.getMarketStats(record.getDiscogsReleaseId());
                if (stats != null && stats.lowestPrice() != null) {
                    record.setLastKnownPrice(stats.lowestPrice());
                    record.setLastKnownPriceCurrency(stats.currency());
                }
            } catch (DiscogsUnavailableException e) {
                // Preis bleibt unbekannt, wird beim naechsten Start erneut versucht
            }
        }
        if (!missingPrice.isEmpty()) {
            recordRepository.saveAll(missingPrice);
        }
    }
}
