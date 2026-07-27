package com.financeapp.core;

import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

/**
 * Base class for repository integration tests with a real PostgreSQL database
 * via Testcontainers. Uses a shared singleton container so multiple test
 * classes in the same JVM fork reuse the same PostgreSQL instance.
 *
 * Schema is generated from JPA entity annotations (ddl-auto: create-drop).
 * Flyway migrations are in financeapp-api, so not used here.
 *
 * Subclasses should focus on repository testing:
 * <pre>{@code
 * class MyRepositoryTest extends AbstractPostgresIntegrationTest {
 *     @Autowired
 *     private MyRepository repository;
 *
 *     @Test
 *     void shouldPersistAndRead() { ... }
 * }
 * }</pre>
 */
@Testcontainers
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
public abstract class AbstractPostgresIntegrationTest {

    /**
     * Shared singleton PostgreSQL container — reused across all
     * integration test classes in the same Maven Surefire fork.
     */
    private static final PostgreSQLContainer<?> postgres;

    static {
        postgres = new PostgreSQLContainer<>("postgres:15-alpine")
                .withDatabaseName("test_financeapp")
                .withUsername("test")
                .withPassword("test");
        postgres.start();
        Runtime.getRuntime().addShutdownHook(new Thread(postgres::stop));
    }

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "create-drop");
        registry.add("spring.jpa.properties.hibernate.dialect",
                () -> "org.hibernate.dialect.PostgreSQLDialect");
        registry.add("spring.flyway.enabled", () -> "false");
    }
}
