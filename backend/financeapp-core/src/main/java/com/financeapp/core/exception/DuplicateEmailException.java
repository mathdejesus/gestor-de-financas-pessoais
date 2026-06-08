package com.financeapp.core.exception;

public class DuplicateEmailException extends RuntimeException {
    public DuplicateEmailException(String email) {
        super(String.format("Email already registered: %s", email));
    }
}
