package org.example.vinyl.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToMany;

import java.util.HashSet;
import java.util.Set;

@Entity
public class VinylRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String artist;
    private String title;
    private String genre;
    private Integer releaseYear;
    private String format;
    private String condition;
    private String notes;
    private String barcode;
    private String styles;
    private String country;
    @Lob
    private String tracklist;
    private String coverImageUrl;
    private Long discogsReleaseId;
    private String label;
    private String catalogNumber;
    private Double lastKnownPrice;
    private String lastKnownPriceCurrency;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "record_collection",
            joinColumns = @JoinColumn(name = "record_id"),
            inverseJoinColumns = @JoinColumn(name = "collection_id"))
    @JsonIgnore
    private Set<VinylCollection> collections = new HashSet<>();

    public VinylRecord() {
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

    public String getGenre() {
        return genre;
    }

    public void setGenre(String genre) {
        this.genre = genre;
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

    public String getCondition() {
        return condition;
    }

    public void setCondition(String condition) {
        this.condition = condition;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getBarcode() {
        return barcode;
    }

    public void setBarcode(String barcode) {
        this.barcode = barcode;
    }

    public String getStyles() {
        return styles;
    }

    public void setStyles(String styles) {
        this.styles = styles;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getTracklist() {
        return tracklist;
    }

    public void setTracklist(String tracklist) {
        this.tracklist = tracklist;
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

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getCatalogNumber() {
        return catalogNumber;
    }

    public void setCatalogNumber(String catalogNumber) {
        this.catalogNumber = catalogNumber;
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

    public Set<VinylCollection> getCollections() {
        return collections;
    }

    public Long getCollectionId() {
        return collections.stream()
                .filter(c -> !c.isGeneral())
                .map(VinylCollection::getId)
                .findFirst()
                .orElse(null);
    }
}
