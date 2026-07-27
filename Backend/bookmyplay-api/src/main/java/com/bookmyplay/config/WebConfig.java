package com.bookmyplay.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Map to C:/BookMyPlay/uploads/ where files are saved
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:C:/BookMyPlay/uploads/");
    }
}
