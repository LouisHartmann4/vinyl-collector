package org.example.vinyl.repository;

import org.example.vinyl.model.VinylRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VinylRecordRepository extends JpaRepository<VinylRecord, Long> {

    List<VinylRecord> findByCollectionsId(Long collectionId);

    List<VinylRecord> findByCollectionsIsEmpty();

    long countByCollectionsId(Long collectionId);

    List<VinylRecord> findByDiscogsReleaseIdIsNotNullAndLastKnownPriceIsNull();

    List<VinylRecord> findByOwnerId(Long ownerId);

    Optional<VinylRecord> findByIdAndOwnerId(Long id, Long ownerId);
}
