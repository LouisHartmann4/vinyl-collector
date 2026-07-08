package org.example.vinyl.repository;

import org.example.vinyl.model.VinylCollection;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VinylCollectionRepository extends JpaRepository<VinylCollection, Long> {
}
