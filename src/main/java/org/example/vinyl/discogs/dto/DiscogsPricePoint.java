package org.example.vinyl.discogs.dto;

public record DiscogsPricePoint(String label, Double lowestPrice, String currency, Integer numForSale, boolean owned) {
}
