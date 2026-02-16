package com.kenyamarket.payments;

public interface PaymentStrategy {
    boolean processPayment(double amount);
}