package org.example.vinyl.repository;

import org.example.vinyl.model.PriceSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface PriceSnapshotRepository extends JpaRepository<PriceSnapshot, Long> {

    Optional<PriceSnapshot> findByRecordIdAndSnapshotDate(Long recordId, LocalDate snapshotDate);

    List<PriceSnapshot> findByRecordIdInOrderBySnapshotDateAsc(Collection<Long> recordIds);

    boolean existsByRecordId(Long recordId);

    boolean existsBySnapshotDate(LocalDate snapshotDate);

    @Transactional
    void deleteByRecordId(Long recordId);

    @Transactional
    void deleteByRecordIdIn(Collection<Long> recordIds);
}
