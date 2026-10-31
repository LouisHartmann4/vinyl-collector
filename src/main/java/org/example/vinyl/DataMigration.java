package org.example.vinyl;

import org.example.vinyl.discogs.DiscogsService;
import org.example.vinyl.discogs.DiscogsUnavailableException;
import org.example.vinyl.discogs.dto.DiscogsMarketStats;
import org.example.vinyl.model.AppUser;
import org.example.vinyl.model.VinylCollection;
import org.example.vinyl.model.VinylRecord;
import org.example.vinyl.repository.AppUserRepository;
import org.example.vinyl.repository.VinylCollectionRepository;
import org.example.vinyl.repository.VinylRecordRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Objects;

@Component
public class DataMigration implements CommandLineRunner {

    private final VinylCollectionRepository collectionRepository;
    private final VinylRecordRepository recordRepository;
    private final DiscogsService discogsService;
    private final AppUserRepository userRepository;
    private final AccountService accountService;

    public DataMigration(VinylCollectionRepository collectionRepository, VinylRecordRepository recordRepository,
                          DiscogsService discogsService, AppUserRepository userRepository,
                          AccountService accountService) {
        this.collectionRepository = collectionRepository;
        this.recordRepository = recordRepository;
        this.discogsService = discogsService;
        this.userRepository = userRepository;
        this.accountService = accountService;
    }

    @Override
    public void run(String... args) {
        assignUserIds();
        assignOrphanRecords();
        backfillMissingPrices();
    }

    private void assignUserIds() {
        List<AppUser> withoutId = userRepository.findAll().stream().filter(AppUser::ensurePublicId).toList();
        userRepository.saveAll(withoutId);
    }

    private void assignOrphanRecords() {
        List<AppUser> users = userRepository.findAll();
        if (users.isEmpty()) {
            // Noch kein Konto: Altdaten ohne Besitzer ordnen, das erste Konto übernimmt sie
            VinylCollection general = collectionRepository.findByOwnerIdIsNull().stream()
                    .filter(VinylCollection::isGeneral)
                    .findFirst()
                    .orElseGet(() -> {
                        VinylCollection c = new VinylCollection();
                        c.setName("Alle Platten");
                        c.setGeneral(true);
                        return collectionRepository.save(c);
                    });
            assignToDefault(recordRepository.findByCollectionsIsEmpty(), general, null);
            return;
        }

        List<VinylRecord> unassigned = recordRepository.findByCollectionsIsEmpty();
        for (AppUser user : users) {
            VinylCollection general = accountService.ensureGeneralCollection(user.getId());
            assignToDefault(unassigned.stream().filter(r -> Objects.equals(r.getOwnerId(), user.getId())).toList(),
                    general, user.getId());
        }
    }

    private void assignToDefault(List<VinylRecord> unassigned, VinylCollection general, Long ownerId) {
        if (unassigned.isEmpty()) {
            return;
        }

        VinylCollection defaultCollection = new VinylCollection();
        defaultCollection.setName("Meine Sammlung");
        defaultCollection.setOwnerId(ownerId);
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
