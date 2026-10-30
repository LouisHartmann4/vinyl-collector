package org.example.vinyl;

import org.example.vinyl.model.VinylCollection;
import org.example.vinyl.repository.VinylCollectionRepository;
import org.springframework.stereotype.Service;

@Service
public class AccountService {

    private final VinylCollectionRepository collectionRepository;

    public AccountService(VinylCollectionRepository collectionRepository) {
        this.collectionRepository = collectionRepository;
    }

    public static String normalize(String username) {
        return username == null ? "" : username.trim().toLowerCase();
    }

    /** Jedes Konto hat genau eine Sammlung "Alle Platten", in der jede seiner Platten liegt. */
    public VinylCollection ensureGeneralCollection(Long ownerId) {
        return collectionRepository.findFirstByOwnerIdAndGeneral(ownerId, true).orElseGet(() -> {
            VinylCollection general = new VinylCollection();
            general.setName("Alle Platten");
            general.setGeneral(true);
            general.setOwnerId(ownerId);
            return collectionRepository.save(general);
        });
    }
}
