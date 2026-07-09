package org.example.vinyl.discogs.dto;

public record DiscogsLookupResult(String artist, String title, String genre, Integer releaseYear, String format,
                                   String styles, String country, String tracklist, String coverImageUrl,
                                   String label, String catalogNumber) {
}
