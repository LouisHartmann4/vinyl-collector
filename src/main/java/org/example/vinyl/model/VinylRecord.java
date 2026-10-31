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
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
public class VinylRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank @Size(max = 255) @Pattern(regexp = InputRules.SINGLE_LINE, message = InputRules.SINGLE_LINE_MESSAGE)
    private String artist;
    @NotBlank @Size(max = 255) @Pattern(regexp = InputRules.SINGLE_LINE, message = InputRules.SINGLE_LINE_MESSAGE)
    private String title;
    @Size(max = 255) @Pattern(regexp = InputRules.SINGLE_LINE, message = InputRules.SINGLE_LINE_MESSAGE)
    private String genre;
    @Min(1850) @Max(2100)
    private Integer releaseYear;
    @Size(max = 255) @Pattern(regexp = InputRules.SINGLE_LINE, message = InputRules.SINGLE_LINE_MESSAGE)
    private String format;
    @Size(max = 255) @Pattern(regexp = InputRules.SINGLE_LINE, message = InputRules.SINGLE_LINE_MESSAGE)
    private String condition;
    @Size(max = 255) @Pattern(regexp = InputRules.MULTI_LINE, message = InputRules.SINGLE_LINE_MESSAGE)
    private String notes;
    @Size(max = 64) @Pattern(regexp = InputRules.SINGLE_LINE, message = InputRules.SINGLE_LINE_MESSAGE)
    private String barcode;
    @Size(max = 255) @Pattern(regexp = InputRules.SINGLE_LINE, message = InputRules.SINGLE_LINE_MESSAGE)
    private String styles;
    @Size(max = 255) @Pattern(regexp = InputRules.SINGLE_LINE, message = InputRules.SINGLE_LINE_MESSAGE)
    private String country;
    @Lob
    @Size(max = 20000) @Pattern(regexp = InputRules.MULTI_LINE, message = InputRules.SINGLE_LINE_MESSAGE)
    private String tracklist;
    @Size(max = 255) @Pattern(regexp = InputRules.WEB_URL, message = InputRules.WEB_URL_MESSAGE)
    private String coverImageUrl;
    @Positive
    private Long discogsReleaseId;
    @Size(max = 255) @Pattern(regexp = InputRules.SINGLE_LINE, message = InputRules.SINGLE_LINE_MESSAGE)
    private String label;
    @Size(max = 255) @Pattern(regexp = InputRules.SINGLE_LINE, message = InputRules.SINGLE_LINE_MESSAGE)
    private String catalogNumber;
    @PositiveOrZero @DecimalMax("10000000")
    private Double lastKnownPrice;
    @Pattern(regexp = "[A-Z]{3}", message = "muss ein Währungskürzel wie EUR sein")
    private String lastKnownPriceCurrency;
    @PositiveOrZero @DecimalMax("10000000")
    private Double purchasePrice;
    private LocalDate purchaseDate;
    @Size(max = 255) @Pattern(regexp = InputRules.SINGLE_LINE, message = InputRules.SINGLE_LINE_MESSAGE)
    private String purchaseSource;

    // Konto, dem der Eintrag gehört; wird nur serverseitig gesetzt
    @JsonIgnore
    private Long ownerId;

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

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
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

    public Double getPurchasePrice() {
        return purchasePrice;
    }

    public void setPurchasePrice(Double purchasePrice) {
        this.purchasePrice = purchasePrice;
    }

    public LocalDate getPurchaseDate() {
        return purchaseDate;
    }

    public void setPurchaseDate(LocalDate purchaseDate) {
        this.purchaseDate = purchaseDate;
    }

    public String getPurchaseSource() {
        return purchaseSource;
    }

    public void setPurchaseSource(String purchaseSource) {
        this.purchaseSource = purchaseSource;
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
