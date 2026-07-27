package com.financeapp.core;

import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Minimal Spring Boot configuration marker for integration tests.
 * Only needed so @DataJpaTest and similar slice annotations can find
 * a @SpringBootConfiguration. The slice annotation itself handles
 * auto-configuration — no explicit component scanning needed.
 */
@SpringBootApplication
public class TestFinanceAppApplication {
}
