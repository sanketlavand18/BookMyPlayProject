package com.bookmyplay.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    // Comma-separated list of allowed frontend origins.
    // Defaults to localhost for local development; set ALLOWED_ORIGINS env var in
    // production,
    // e.g. ALLOWED_ORIGINS=https://your-app.vercel.app,http://localhost:3000
    @Value("${ALLOWED_ORIGINS:http://localhost:3000}")
    private String allowedOrigins;

    @Bean
    public WebMvcConfigurer corsConfigurer() {

        return new WebMvcConfigurer() {

            @Override
            public void addCorsMappings(CorsRegistry registry) {

                registry.addMapping("/**")
                        .allowedOrigins(allowedOrigins.split("\\s*,\\s*"))
                        .allowedMethods("*")
                        .allowedHeaders("*");
            }
        };
    }
}
