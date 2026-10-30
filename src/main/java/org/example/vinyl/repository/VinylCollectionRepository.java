package org.example.vinyl.repository;

import org.example.vinyl.model.VinylCollection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VinylCollectionRepository extends JpaRepository<VinylCollection, Long> {

    List<VinylCollection> findByOwnerId(Long ownerId);

    Optional<VinylCollection> findByIdAndOwnerId(Long id, Long ownerId);

    Optional<VinylCollection> findFirstByOwnerIdAndGeneral(Long ownerId, Boolean general);

    List<VinylCollection> findByOwnerIdIsNull();
}
