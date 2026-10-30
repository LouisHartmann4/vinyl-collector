package org.example.vinyl;

import org.example.vinyl.discogs.DiscogsService;
import org.example.vinyl.discogs.DiscogsUnavailableException;
import org.example.vinyl.discogs.dto.DiscogsMarketStats;
import org.example.vinyl.model.PriceSnapshot;
import org.example.vinyl.model.VinylRecord;
import org.example.vinyl.repository.AppUserRepository;
import org.example.vinyl.repository.PriceSnapshotRepository;
import org.example.vinyl.repository.VinylRecordRepository;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Hält die Marktpreise aktuell und schreibt pro Tag einen Preis-Schnappschuss je Platte.
 * Die Aktualisierung läuft pro Konto im Hintergrund. Alle Konten teilen sich einen einzigen Arbeits-Thread,
 * damit das Discogs-Limit (60 Anfragen pro Minute) auch bei mehreren gleichzeitigen Aufträgen hält;
 * jedes Konto sieht nur den Fortschritt seiner eigenen Platten.
 */
@Service
public class PriceTrackingService {

    private static final long DISCOGS_DELAY_MS = 1100;

    private final VinylRecordRepository recordRepository;
    private final PriceSnapshotRepository snapshotRepository;
    private final DiscogsService discogsService;
    private final AppUserRepository userRepository;

    private final ExecutorService worker = Executors.newSingleThreadExecutor(r -> {
        Thread t = new Thread(r, "price-refresh");
        t.setDaemon(true);
        return t;
    });
    private final Map<Long, Progress> progress = new ConcurrentHashMap<>();

    public PriceTrackingService(VinylRecordRepository recordRepository, PriceSnapshotRepository snapshotRepository,
                                DiscogsService discogsService, AppUserRepository userRepository) {
        this.recordRepository = recordRepository;
        this.snapshotRepository = snapshotRepository;
        this.discogsService = discogsService;
        this.userRepository = userRepository;
    }

    /** Speichert den aktuellen Preis einer Platte als heutigen Schnappschuss (überschreibt einen vorhandenen). */
    public void recordSnapshot(VinylRecord record) {
        if (record.getId() == null || record.getLastKnownPrice() == null) {
            return;
        }
        LocalDate today = LocalDate.now();
        PriceSnapshot snapshot = snapshotRepository.findByRecordIdAndSnapshotDate(record.getId(), today)
                .orElseGet(() -> new PriceSnapshot(record.getId(), today, null, null));
        snapshot.setPrice(record.getLastKnownPrice());
        snapshot.setCurrency(record.getLastKnownPriceCurrency());
        snapshotRepository.save(snapshot);
    }

    /** Reiht die Aktualisierung der Preise eines Kontos ein; false, wenn für das Konto schon eine läuft. */
    public boolean startRefresh(Long ownerId) {
        Progress fresh = new Progress();
        Progress previous = progress.compute(ownerId, (id, p) -> p != null && p.running ? p : fresh);
        if (previous != fresh) {
            return false;
        }
        worker.submit(() -> refreshOwner(ownerId, fresh));
        return true;
    }

    public RefreshStatus status(Long ownerId) {
        Progress p = progress.get(ownerId);
        if (p == null) {
            return new RefreshStatus(false, 0, 0, 0, null);
        }
        return new RefreshStatus(p.running, p.total, p.done, p.failed, p.finishedAt);
    }

    // Täglich nachts, damit die Wertentwicklung auch ohne Zutun wächst
    @Scheduled(cron = "0 30 3 * * *")
    public void nightlyRefresh() {
        refreshAllAccounts();
    }

    private void refreshAllAccounts() {
        userRepository.findAll().forEach(user -> startRefresh(user.getId()));
    }

    // Läuft die App nicht dauerhaft, holt der erste Start eines Tages die Preise nach
    @EventListener(ApplicationReadyEvent.class)
    public void onStartup() {
        boolean refreshedToday = snapshotRepository.existsBySnapshotDate(LocalDate.now());
        seedSnapshotsFromKnownPrices();
        if (!refreshedToday) {
            refreshAllAccounts();
        }
    }

    /** Platten mit bekanntem Preis, aber ohne Verlauf, bekommen ihren Preis als ersten Punkt. */
    private void seedSnapshotsFromKnownPrices() {
        for (VinylRecord record : recordRepository.findAll()) {
            if (record.getLastKnownPrice() != null && !snapshotRepository.existsByRecordId(record.getId())) {
                recordSnapshot(record);
            }
        }
    }

    private void refreshOwner(Long ownerId, Progress p) {
        try {
            List<VinylRecord> records = recordRepository.findByOwnerId(ownerId).stream()
                    .filter(r -> r.getDiscogsReleaseId() != null)
                    .toList();
            p.total = records.size();

            for (VinylRecord record : records) {
                try {
                    DiscogsMarketStats stats = discogsService.getMarketStats(record.getDiscogsReleaseId());
                    if (stats != null && stats.lowestPrice() != null) {
                        // frisch laden, damit gleichzeitige Bearbeitungen nicht überschrieben werden
                        recordRepository.findById(record.getId()).ifPresent(current -> {
                            current.setLastKnownPrice(stats.lowestPrice());
                            current.setLastKnownPriceCurrency(stats.currency());
                            recordRepository.save(current);
                            recordSnapshot(current);
                        });
                    }
                } catch (DiscogsUnavailableException e) {
                    p.failed++;
                }
                p.done++;
                Thread.sleep(DISCOGS_DELAY_MS);
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } catch (RuntimeException e) {
            // ein Fehler bei einem Konto darf die Warteschlange der anderen nicht anhalten
        } finally {
            p.finishedAt = Instant.now();
            p.running = false;
        }
    }

    /**
     * Wert der übergebenen Platten je Tag: Summe des jeweils letzten bekannten Preises jeder Platte
     * bis zu diesem Tag. Platten ohne Preis zählen nicht mit.
     */
    public ValueHistory valueHistory(List<VinylRecord> records) {
        List<Long> ids = records.stream().map(VinylRecord::getId).toList();
        if (ids.isEmpty()) {
            return new ValueHistory(null, List.of());
        }

        TreeMap<LocalDate, List<PriceSnapshot>> byDate = new TreeMap<>();
        String currency = null;
        for (PriceSnapshot s : snapshotRepository.findByRecordIdInOrderBySnapshotDateAsc(ids)) {
            byDate.computeIfAbsent(s.getSnapshotDate(), d -> new ArrayList<>()).add(s);
            if (currency == null) {
                currency = s.getCurrency();
            }
        }

        Map<Long, Double> latest = new HashMap<>();
        List<ValuePoint> points = new ArrayList<>();
        for (Map.Entry<LocalDate, List<PriceSnapshot>> day : byDate.entrySet()) {
            for (PriceSnapshot s : day.getValue()) {
                latest.put(s.getRecordId(), s.getPrice());
            }
            double value = latest.values().stream().mapToDouble(Double::doubleValue).sum();
            points.add(new ValuePoint(day.getKey(), Math.round(value * 100) / 100.0, latest.size()));
        }
        return new ValueHistory(currency, points);
    }

    /** Fortschritt eines Kontos; total bleibt 0, solange der Auftrag noch in der Warteschlange wartet. */
    private static final class Progress {
        volatile boolean running = true;
        volatile int total;
        volatile int done;
        volatile int failed;
        volatile Instant finishedAt;
    }

    public record RefreshStatus(boolean running, int total, int done, int failed, Instant finishedAt) {
    }

    public record ValuePoint(LocalDate date, double value, int pricedCount) {
    }

    public record ValueHistory(String currency, List<ValuePoint> points) {
    }
}
