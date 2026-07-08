package org.example.vinyl.repository;

import org.example.vinyl.model.VinylRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VinylRecordRepository extends JpaRepository<VinylRecord, Long> {
}
