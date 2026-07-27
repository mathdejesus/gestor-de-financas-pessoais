package com.financeapp.api.config;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * JPA and infrastructure configuration for production runs.
 * Loads financeapp-core beans (services, repositories, entities).
 *
 * Disabled automatically in @WebMvcTest slices by setting
 * app.jpa.enabled=false.
 */
@Configuration
@ConditionalOnProperty(name = "app.jpa.enabled", havingValue = "true", matchIfMissing = true)
@ComponentScan(basePackages = "com.financeapp.core")
@EnableJpaRepositories(basePackages = "com.financeapp.core.repository")
@EntityScan(basePackages = "com.financeapp.core.entity")
public class JpaConfig {
}
