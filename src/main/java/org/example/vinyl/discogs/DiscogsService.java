package org.example.vinyl.discogs;

import org.example.vinyl.discogs.dto.DiscogsLookupResult;
import org.example.vinyl.discogs.dto.DiscogsMarketStats;
import org.example.vinyl.discogs.dto.DiscogsPriceAnalysis;
import org.example.vinyl.discogs.dto.DiscogsSearchResult;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;

import java.util.List;

@Service
public class DiscogsService {

    private final DiscogsClient client;

    public DiscogsService(DiscogsClient client) {
        this.client = client;
    }

    public List<DiscogsSearchResult> searchByBarcode(String barcode) {
        try {
            return client.searchByBarcode(barcode);
        } catch (RestClientException e) {
            throw new DiscogsUnavailableException("Discogs-Suche fehlgeschlagen", e);
        }
    }

    public List<DiscogsSearchResult> searchByQuery(String query) {
        try {
            return client.searchByQuery(query);
        } catch (RestClientException e) {
            throw new DiscogsUnavailableException("Discogs-Suche fehlgeschlagen", e);
        }
    }

    public DiscogsLookupResult getRelease(long id) {
        try {
            return client.getRelease(id);
        } catch (RestClientException e) {
            throw new DiscogsUnavailableException("Discogs-Release konnte nicht geladen werden", e);
        }
    }

    public DiscogsMarketStats getMarketStats(long releaseId) {
        try {
            return client.getMarketStats(releaseId);
        } catch (RestClientException e) {
            throw new DiscogsUnavailableException("Marktdaten konnten nicht geladen werden", e);
        }
    }

    public DiscogsPriceAnalysis getPriceAnalysis(long releaseId) {
        try {
            return client.getPriceAnalysis(releaseId);
        } catch (RestClientException e) {
            throw new DiscogsUnavailableException("Preisanalyse konnte nicht geladen werden", e);
        }
    }
}
