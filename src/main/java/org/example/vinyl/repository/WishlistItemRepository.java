package org.example.vinyl.repository;

import org.example.vinyl.model.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {

    boolean existsByDiscogsReleaseId(Long discogsReleaseId);
}
