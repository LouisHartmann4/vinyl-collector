package org.example.vinyl.repository;

import org.example.vinyl.model.VinylRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VinylRecordRepository extends JpaRepository<VinylRecord, Long> {

    List<VinylRecord> findByCollectionsId(Long collectionId);

    List<VinylRecord> findByCollectionsIsEmpty();

    long countByCollectionsId(Long collectionId);
}
