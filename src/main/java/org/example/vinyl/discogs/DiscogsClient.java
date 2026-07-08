package org.example.vinyl.discogs;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.example.vinyl.discogs.dto.DiscogsLookupResult;
import org.example.vinyl.discogs.dto.DiscogsSearchResult;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;

@Component
public class DiscogsClient {

    private final RestClient restClient;
    private final String token;

    public DiscogsClient(RestClient.Builder builder,
                          @Value("${discogs.user-agent}") String userAgent,
                          @Value("${discogs.token}") String token) {
        this.restClient = builder
                .baseUrl("https://api.discogs.com")
                .defaultHeader(HttpHeaders.USER_AGENT, userAgent)
                .build();
        this.token = token;
    }

    public List<DiscogsSearchResult> searchByBarcode(String barcode) {
        SearchResponse response = restClient.get()
                .uri(uriBuilder -> {
                    uriBuilder.path("/database/search")
                            .queryParam("barcode", barcode)
                            .queryParam("type", "release");
                    if (!token.isBlank()) {
                        uriBuilder.queryParam("token", token);
                    }
                    return uriBuilder.build();
                })
                .retrieve()
                .body(SearchResponse.class);

        if (response == null || response.results() == null) {
            return List.of();
        }
        return response.results().stream()
                .map(r -> new DiscogsSearchResult(r.id(), r.title(), parseYear(r.year()), r.thumb(), r.coverImage()))
                .toList();
    }

    public DiscogsLookupResult getRelease(long id) {
        ReleaseResponse response = restClient.get()
                .uri(uriBuilder -> {
                    uriBuilder.path("/releases/{id}");
                    if (!token.isBlank()) {
                        uriBuilder.queryParam("token", token);
                    }
                    return uriBuilder.build(id);
                })
                .retrieve()
                .body(ReleaseResponse.class);

        if (response == null) {
            return null;
        }

        String artist = response.artists() == null ? null : response.artists().stream()
                .map(ArtistRaw::name)
                .filter(n -> n != null && !n.isBlank())
                .reduce((a, b) -> a + ", " + b)
                .orElse(null);

        String genre = response.genres() == null || response.genres().isEmpty() ? null : response.genres().get(0);

        String format = response.formats() == null || response.formats().isEmpty() ? null : response.formats().get(0).name();

        Integer year = response.year() == null || response.year() == 0 ? null : response.year();

        return new DiscogsLookupResult(artist, response.title(), genre, year, format);
    }

    private static Integer parseYear(String year) {
        if (year == null || year.isBlank()) {
            return null;
        }
        try {
            return Integer.parseInt(year.trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record SearchResponse(List<SearchResultRaw> results) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record SearchResultRaw(long id, String title, String year, String thumb,
                                    @JsonProperty("cover_image") String coverImage) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record ReleaseResponse(String title, List<ArtistRaw> artists, Integer year,
                                    List<String> genres, List<FormatRaw> formats) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record ArtistRaw(String name) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record FormatRaw(String name) {
    }
}
