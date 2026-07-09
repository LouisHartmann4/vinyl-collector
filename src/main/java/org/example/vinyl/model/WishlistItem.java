package org.example.vinyl.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class WishlistItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String artist;
    private String title;
    private Integer releaseYear;
    private String format;
    private String catalogNumber;
    private String coverImageUrl;
    private Long discogsReleaseId;
    private Double lastKnownPrice;
    private String lastKnownPriceCurrency;

    public WishlistItem() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getArtist() {
        return artist;
    }

    public void setArtist(String artist) {
        this.artist = artist;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Integer getReleaseYear() {
        return releaseYear;
    }

    public void setReleaseYear(Integer releaseYear) {
        this.releaseYear = releaseYear;
    }

    public String getFormat() {
        return format;
    }

    public void setFormat(String format) {
        this.format = format;
    }

    public String getCatalogNumber() {
        return catalogNumber;
    }

    public void setCatalogNumber(String catalogNumber) {
        this.catalogNumber = catalogNumber;
    }

    public String getCoverImageUrl() {
        return coverImageUrl;
    }

    public void setCoverImageUrl(String coverImageUrl) {
        this.coverImageUrl = coverImageUrl;
    }

    public Long getDiscogsReleaseId() {
        return discogsReleaseId;
    }

    public void setDiscogsReleaseId(Long discogsReleaseId) {
        this.discogsReleaseId = discogsReleaseId;
    }

    public Double getLastKnownPrice() {
        return lastKnownPrice;
    }

    public void setLastKnownPrice(Double lastKnownPrice) {
        this.lastKnownPrice = lastKnownPrice;
    }

    public String getLastKnownPriceCurrency() {
        return lastKnownPriceCurrency;
    }

    public void setLastKnownPriceCurrency(String lastKnownPriceCurrency) {
        this.lastKnownPriceCurrency = lastKnownPriceCurrency;
    }
}
