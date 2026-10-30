package org.example.vinyl.discogs.dto;

import java.util.List;

public record DiscogsSearchResult(long id, String title, Integer year, String thumb, String coverImage, String catalogNumber,
                                  String country, List<String> formats, List<String> labels) {
}
