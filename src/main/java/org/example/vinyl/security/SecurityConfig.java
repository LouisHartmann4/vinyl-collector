package org.example.vinyl.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.example.vinyl.AccountService;
import org.example.vinyl.repository.AppUserRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.security.web.header.writers.StaticHeadersWriter;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.util.matcher.AnyRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    static final String LOGIN_URL = "/api/auth/login";

    // style-src braucht 'unsafe-inline' für die Cover als background-image und den Scanner;
    // Skripte bleiben streng: kein Inline-Code, kein eval
    private static final String CONTENT_SECURITY_POLICY = String.join("; ",
            "default-src 'self'",
            "script-src 'self' https://unpkg.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src https://fonts.gstatic.com",
            "img-src 'self' https: data: blob:",
            "media-src 'self' blob:",
            "connect-src 'self'",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'none'");

    @Bean
    public PasswordEncoder passwordEncoder() {
        // bcrypt, mit Präfix im Hash, damit sich das Verfahren später wechseln lässt
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService(AppUserRepository userRepository) {
        return username -> userRepository.findByUsername(AccountService.normalize(username))
                .map(AppUserPrincipal::new)
                .orElseThrow(() -> new UsernameNotFoundException("unknown"));
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, LoginAttemptService attempts) throws Exception {
        RequestMatcher api = request -> request.getRequestURI().startsWith("/api/");

        http
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/login.html", "/login.js", "/style.css", "/favicon.ico", "/error",
                                "/api/auth/me").permitAll()
                        .anyRequest().authenticated())
                // Token im lesbaren Cookie, das Frontend schickt es als X-XSRF-TOKEN zurück
                .csrf(csrf -> csrf
                        .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                        .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler()))
                // Zweite Verteidigungslinie gegen XSS: der Browser führt nur Skripte von hier und dem
                // Barcode-Scanner (unpkg, per Integritäts-Hash) aus, nie eingeschleusten Inline-Code
                .headers(headers -> headers
                        .contentSecurityPolicy(csp -> csp.policyDirectives(CONTENT_SECURITY_POLICY))
                        .referrerPolicy(referrer -> referrer.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.SAME_ORIGIN))
                        .addHeaderWriter(new StaticHeadersWriter("Permissions-Policy",
                                "camera=(self), microphone=(), geolocation=(), payment=()")))
                .addFilterAfter(new CsrfCookieFilter(), BasicAuthenticationFilter.class)
                .addFilterBefore(new LoginLockFilter(attempts), UsernamePasswordAuthenticationFilter.class)
                .formLogin(form -> form
                        .loginPage("/login.html")
                        .loginProcessingUrl(LOGIN_URL)
                        .successHandler((request, response, authentication) -> {
                            attempts.succeeded(request.getParameter("username"), request.getRemoteAddr());
                            writeJson(response, HttpStatus.OK, "{\"username\":" + jsonString(authentication.getName()) + "}");
                        })
                        .failureHandler((request, response, exception) -> {
                            String username = request.getParameter("username");
                            attempts.failed(username, request.getRemoteAddr());
                            long locked = attempts.secondsLocked(username, request.getRemoteAddr());
                            writeJson(response, locked > 0 ? HttpStatus.TOO_MANY_REQUESTS : HttpStatus.UNAUTHORIZED,
                                    lockedOrWrong(locked));
                        })
                        .permitAll())
                .logout(logout -> logout
                        .logoutUrl("/api/auth/logout")
                        .logoutSuccessHandler((request, response, authentication) -> response.setStatus(HttpStatus.NO_CONTENT.value())))
                // API-Aufrufe ohne Anmeldung bekommen 401; Seiten zeigen die Anmeldung unter derselben
                // Adresse (Forward statt Weiterleitung), damit kein /login.html in der Adresszeile steht
                .exceptionHandling(ex -> ex
                        .defaultAuthenticationEntryPointFor(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED), api)
                        .defaultAuthenticationEntryPointFor(loginForward(), AnyRequestMatcher.INSTANCE));

        return http.build();
    }

    private static LoginUrlAuthenticationEntryPoint loginForward() {
        LoginUrlAuthenticationEntryPoint entryPoint = new LoginUrlAuthenticationEntryPoint("/login.html");
        entryPoint.setUseForward(true);
        return entryPoint;
    }

    private static String lockedOrWrong(long lockedSeconds) {
        if (lockedSeconds > 0) {
            long minutes = (lockedSeconds + 59) / 60;
            return "{\"error\":\"Zu viele Fehlversuche. Bitte in " + minutes + (minutes == 1 ? " Minute" : " Minuten")
                    + " erneut versuchen.\",\"retryAfter\":" + lockedSeconds + "}";
        }
        return "{\"error\":\"Benutzername oder Passwort ist falsch.\"}";
    }

    private static void writeJson(HttpServletResponse response, HttpStatus status, String body) throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(body);
    }

    private static String jsonString(String value) {
        return "\"" + value.replace("\\", "\\\\").replace("\"", "\\\"") + "\"";
    }

    /** Lädt das CSRF-Token bei jeder Anfrage, damit das Cookie immer gesetzt ist (auch nach Login und Logout). */
    private static final class CsrfCookieFilter extends OncePerRequestFilter {
        @Override
        protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
                throws ServletException, IOException {
            CsrfToken token = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
            if (token != null) {
                token.getToken();
            }
            chain.doFilter(request, response);
        }
    }

    /** Weist Anmeldeversuche ab, solange Name und Adresse nach zu vielen Fehlversuchen gesperrt sind. */
    private static final class LoginLockFilter extends OncePerRequestFilter {
        private final LoginAttemptService attempts;

        LoginLockFilter(LoginAttemptService attempts) {
            this.attempts = attempts;
        }

        @Override
        protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
                throws ServletException, IOException {
            if ("POST".equals(request.getMethod()) && LOGIN_URL.equals(request.getServletPath())) {
                long locked = attempts.secondsLocked(request.getParameter("username"), request.getRemoteAddr());
                if (locked > 0) {
                    response.setHeader("Retry-After", String.valueOf(locked));
                    writeJson(response, HttpStatus.TOO_MANY_REQUESTS, lockedOrWrong(locked));
                    return;
                }
            }
            chain.doFilter(request, response);
        }
    }
}
