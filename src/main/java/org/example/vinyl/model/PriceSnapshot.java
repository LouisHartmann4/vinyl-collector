package org.example.vinyl.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;

import java.time.LocalDate;

/**
 * Niedrigster Discogs-Angebotspreis einer Platte an einem Tag. Höchstens ein Eintrag pro Platte und Tag;
 * aus der Folge dieser Einträge entsteht die Wertentwicklung einer Sammlung.
 */
@Entity
@Table(indexes = @Index(columnList = "recordId, snapshotDate"))
public class PriceSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long recordId;
    private LocalDate snapshotDate;
    private Double price;
    private String currency;

    public PriceSnapshot() {
    }

    public PriceSnapshot(Long recordId, LocalDate snapshotDate, Double price, String currency) {
        this.recordId = recordId;
        this.snapshotDate = snapshotDate;
        this.price = price;
        this.currency = currency;
    }

    public Long getId() {
        return id;
    }

    public Long getRecordId() {
        return recordId;
    }

    public LocalDate getSnapshotDate() {
        return snapshotDate;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }
}
