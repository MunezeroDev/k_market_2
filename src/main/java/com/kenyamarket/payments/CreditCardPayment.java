package com.kenyamarket.payments;

public class CreditCardPayment implements PaymentStrategy {
    private String cardNumber;
    private String cvv;

    public CreditCardPayment(String cardNumber, String cvv) {
        this.cardNumber = cardNumber;
        this.cvv = cvv;
    }

    @Override
    public boolean processPayment(double amount) {
        System.out.println("Processing Credit Card payment of Ksh. " + amount);
        System.out.println("Card Number: " + maskCardNumber(cardNumber));
        
        // Simulate payment processing
        if (cardNumber != null && !cardNumber.isEmpty() && cvv != null && cvv.length() == 3) {
            System.out.println("✅ Credit Card payment successful!");
            return true;
        }
        
        System.out.println("❌ Credit Card payment failed!");
        return false;
    }

    private String maskCardNumber(String cardNumber) {
        if (cardNumber == null || cardNumber.length() < 4) {
            return "****";
        }
        return "**** **** **** " + cardNumber.substring(cardNumber.length() - 4);
    }

    public String getCardNumber() {
        return cardNumber;
    }

    public void setCardNumber(String cardNumber) {
        this.cardNumber = cardNumber;
    }

    public String getCvv() {
        return cvv;
    }

    public void setCvv(String cvv) {
        this.cvv = cvv;
    }
}