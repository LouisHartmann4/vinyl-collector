package org.example.vinyl.model;

/**
 * Gemeinsame Regeln für Eingaben. Texte werden unverändert gespeichert und erst bei der Ausgabe
 * maskiert; hier werden nur Steuerzeichen und unsichere Adressen abgewiesen.
 */
public final class InputRules {

    /** Eine Zeile Text ohne Steuerzeichen. */
    public static final String SINGLE_LINE = "[^\\p{Cntrl}]*";
    /** Mehrzeiliger Text: Zeilenumbrüche und Tabs erlaubt, sonst keine Steuerzeichen. */
    public static final String MULTI_LINE = "(?:[^\\p{Cntrl}]|[\\r\\n\\t])*";
    /** Nur https-Adressen und keine Zeichen, mit denen man aus einem Attribut oder url(...) ausbrechen kann. */
    public static final String WEB_URL = "https://[^\\s\"'()<>\\\\`]+";

    public static final String SINGLE_LINE_MESSAGE = "darf keine Steuerzeichen enthalten";
    public static final String WEB_URL_MESSAGE = "muss eine https-Adresse sein";

    private InputRules() {
    }
}
