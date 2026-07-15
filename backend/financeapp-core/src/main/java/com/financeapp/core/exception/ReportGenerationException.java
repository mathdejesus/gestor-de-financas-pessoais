package com.financeapp.core.exception;

/**
 * Exception thrown when PDF or report generation fails.
 * Wraps underlying document generation errors (e.g., OpenPDF, iText)
 * to provide a domain-specific error that can be handled by GlobalExceptionHandler.
 */
public class ReportGenerationException extends RuntimeException {

    public ReportGenerationException(String message, Throwable cause) {
        super(message, cause);
    }

    public ReportGenerationException(String message) {
        super(message);
    }
}