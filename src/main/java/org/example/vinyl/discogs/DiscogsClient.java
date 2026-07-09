package org.example.vinyl.discogs;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.example.vinyl.discogs.dto.DiscogsLookupResult;
import org.example.vinyl.discogs.dto.DiscogsMarketStats;
import org.example.vinyl.discogs.dto.DiscogsPriceAnalysis;
import org.example.vinyl.discogs.dto.DiscogsPricePoint;
import org.example.vinyl.discogs.dto.DiscogsSearchResult;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

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
        return search("barcode", barcode);
    }

    public List<DiscogsSearchResult> searchByQuery(String query) {
        return search("q", query);
    }

    private List<DiscogsSearchResult> search(String paramName, String paramValue) {
        SearchResponse response = restClient.get()
                .uri(uriBuilder -> {
                    uriBuilder.path("/database/search")
                            .queryParam(paramName, paramValue)
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
                .map(r -> new DiscogsSearchResult(r.id(), r.title(), parseYear(r.year()), r.thumb(), r.coverImage(), r.catno()))
                .toList();
    }

    public DiscogsLookupResult getRelease(long id) {
        ReleaseResponse response = fetchRelease(id);

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

        String styles = response.styles() == null || response.styles().isEmpty() ? null : String.join(", ", response.styles());

        String tracklist = response.tracklist() == null ? null : response.tracklist().stream()
                .map(DiscogsClient::formatTrack)
                .filter(t -> !t.isBlank())
                .reduce((a, b) -> a + "\n" + b)
                .orElse(null);

        String coverImageUrl = response.images() == null ? null : response.images().stream()
                .filter(img -> "primary".equals(img.type()))
                .findFirst()
                .or(() -> response.images().stream().findFirst())
                .map(ImageRaw::uri)
                .orElse(null);

        String label = response.labels() == null || response.labels().isEmpty() ? null : response.labels().get(0).name();

        String catalogNumber = response.labels() == null || response.labels().isEmpty() ? null : response.labels().get(0).catno();

        return new DiscogsLookupResult(artist, response.title(), genre, year, format,
                styles, response.country(), tracklist, coverImageUrl, label, catalogNumber);
    }

    public DiscogsMarketStats getMarketStats(long releaseId) {
        StatsResponse response = fetchMarketStats(releaseId);

        if (response == null) {
            return null;
        }

        Double value = response.lowestPrice() == null ? null : response.lowestPrice().value();
        String currency = response.lowestPrice() == null ? null : response.lowestPrice().currency();

        return new DiscogsMarketStats(response.numForSale(), value, currency,
                Boolean.TRUE.equals(response.blockedFromSale()));
    }

    public DiscogsPriceAnalysis getPriceAnalysis(long releaseId) {
        ReleaseResponse release = fetchRelease(releaseId);
        if (release == null) {
            return new DiscogsPriceAnalysis(List.of());
        }

        List<VersionRaw> candidates;
        if (release.masterId() == null) {
            candidates = List.of(new VersionRaw(releaseId, release.country(),
                    release.labels() == null || release.labels().isEmpty() ? null : release.labels().get(0).catno(),
                    String.valueOf(release.year()), List.of("Vinyl"), null));
        } else {
            VersionsResponse versions = restClient.get()
                    .uri(uriBuilder -> {
                        uriBuilder.path("/masters/{id}/versions").queryParam("per_page", 60);
                        if (!token.isBlank()) {
                            uriBuilder.queryParam("token", token);
                        }
                        return uriBuilder.build(release.masterId());
                    })
                    .retrieve()
                    .body(VersionsResponse.class);

            List<VersionRaw> vinylVersions = versions == null || versions.versions() == null ? List.of()
                    : versions.versions().stream()
                    .filter(v -> v.majorFormats() != null && v.majorFormats().stream()
                            .anyMatch(f -> f.toLowerCase(Locale.ROOT).contains("vinyl")))
                    .toList();

            boolean ownedIncluded = vinylVersions.stream().anyMatch(v -> v.id() == releaseId);
            List<VersionRaw> sorted = vinylVersions.stream()
                    .sorted(Comparator.comparing((VersionRaw v) -> v.stats() == null || v.stats().community() == null
                            || v.stats().community().inCollection() == null ? 0 : v.stats().community().inCollection()).reversed())
                    .toList();

            List<VersionRaw> capped = sorted.stream().limit(8).collect(Collectors.toCollection(ArrayList::new));
            if (!ownedIncluded) {
                capped.add(0, new VersionRaw(releaseId, release.country(),
                        release.labels() == null || release.labels().isEmpty() ? null : release.labels().get(0).catno(),
                        String.valueOf(release.year()), List.of("Vinyl"), null));
            } else if (capped.stream().noneMatch(v -> v.id() == releaseId)) {
                vinylVersions.stream().filter(v -> v.id() == releaseId).findFirst().ifPresent(v -> capped.add(0, v));
            }
            candidates = capped.size() > 9 ? capped.subList(0, 9) : capped;
        }

        List<DiscogsPricePoint> points = candidates.stream()
                .map(v -> {
                    StatsResponse stats = fetchMarketStats(v.id());
                    String label = v.catno() != null && !v.catno().isBlank() ? v.catno()
                            : (v.country() != null ? v.country() : String.valueOf(v.released()));
                    Double price = stats == null || stats.lowestPrice() == null ? null : stats.lowestPrice().value();
                    String currency = stats == null || stats.lowestPrice() == null ? null : stats.lowestPrice().currency();
                    Integer numForSale = stats == null ? null : stats.numForSale();
                    return new DiscogsPricePoint(label, price, currency, numForSale, v.id() == releaseId);
                })
                .filter(p -> p.lowestPrice() != null)
                .toList();

        return new DiscogsPriceAnalysis(points);
    }

    private ReleaseResponse fetchRelease(long id) {
        return restClient.get()
                .uri(uriBuilder -> {
                    uriBuilder.path("/releases/{id}");
                    if (!token.isBlank()) {
                        uriBuilder.queryParam("token", token);
                    }
                    return uriBuilder.build(id);
                })
                .retrieve()
                .body(ReleaseResponse.class);
    }

    private StatsResponse fetchMarketStats(long releaseId) {
        return restClient.get()
                .uri(uriBuilder -> {
                    uriBuilder.path("/marketplace/stats/{id}");
                    if (!token.isBlank()) {
                        uriBuilder.queryParam("token", token);
                    }
                    return uriBuilder.build(releaseId);
                })
                .retrieve()
                .body(StatsResponse.class);
    }

    private static String formatTrack(TrackRaw track) {
        StringBuilder sb = new StringBuilder();
        if (track.position() != null && !track.position().isBlank()) {
            sb.append(track.position()).append(" ");
        }
        sb.append(track.title() == null ? "" : track.title());
        if (track.duration() != null && !track.duration().isBlank()) {
            sb.append(" (").append(track.duration()).append(")");
        }
        return sb.toString().trim();
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
                                    @JsonProperty("cover_image") String coverImage, String catno) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record ReleaseResponse(String title, List<ArtistRaw> artists, Integer year,
                                    List<String> genres, List<String> styles, String country,
                                    List<FormatRaw> formats, List<TrackRaw> tracklist,
                                    List<ImageRaw> images, List<LabelRaw> labels,
                                    @JsonProperty("master_id") Long masterId) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record ArtistRaw(String name) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record FormatRaw(String name) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record TrackRaw(String position, String title, String duration) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record ImageRaw(String type, String uri) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record LabelRaw(String name, String catno) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record StatsResponse(@JsonProperty("num_for_sale") Integer numForSale,
                                  @JsonProperty("lowest_price") PriceRaw lowestPrice,
                                  @JsonProperty("blocked_from_sale") Boolean blockedFromSale) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record PriceRaw(Double value, String currency) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record VersionsResponse(List<VersionRaw> versions) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record VersionRaw(long id, String country, String catno, String released,
                               @JsonProperty("major_formats") List<String> majorFormats,
                               VersionStatsRaw stats) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record VersionStatsRaw(CommunityStatsRaw community) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record CommunityStatsRaw(@JsonProperty("in_collection") Integer inCollection) {
    }
}
