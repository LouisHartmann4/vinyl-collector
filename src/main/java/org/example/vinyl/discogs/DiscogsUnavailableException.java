package org.example.vinyl.discogs;

public class DiscogsUnavailableException extends RuntimeException {

    public DiscogsUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }
}
