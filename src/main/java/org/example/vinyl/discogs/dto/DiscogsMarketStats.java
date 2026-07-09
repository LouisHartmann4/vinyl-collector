package org.example.vinyl.discogs.dto;

public record DiscogsMarketStats(Integer numForSale, Double lowestPrice, String currency, boolean blockedFromSale) {
}
