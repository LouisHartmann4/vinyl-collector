package org.example.vinyl.repository;

import org.example.vinyl.model.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {

    List<WishlistItem> findByOwnerId(Long ownerId);

    Optional<WishlistItem> findByIdAndOwnerId(Long id, Long ownerId);

    boolean existsByDiscogsReleaseIdAndOwnerId(Long discogsReleaseId, Long ownerId);
}
