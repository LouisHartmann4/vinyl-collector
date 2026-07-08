package org.example.vinyl.discogs;

import org.example.vinyl.discogs.dto.DiscogsLookupResult;
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

    public DiscogsLookupResult getRelease(long id) {
        try {
            return client.getRelease(id);
        } catch (RestClientException e) {
            throw new DiscogsUnavailableException("Discogs-Release konnte nicht geladen werden", e);
        }
    }
}
