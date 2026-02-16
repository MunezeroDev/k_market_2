package com.kenyamarket.payments;

public class ShoppingCart {
    private PaymentStrategy paymentStrategy;

    public ShoppingCart() {
    }

    public void setPaymentStrategy(PaymentStrategy paymentStrategy) {
        this.paymentStrategy = paymentStrategy;
    }

    public boolean checkOut(double amount) {
        if (paymentStrategy == null) {
            System.out.println("❌ No payment method selected!");
            return false;
        }
        
        return paymentStrategy.processPayment(amount);
    }

    public PaymentStrategy getPaymentStrategy() {
        return paymentStrategy;
    }
}