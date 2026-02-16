package com.kenyamarket.payments;

public class MpesaPayment implements PaymentStrategy {
    private String phoneNumber;
    private String pin;

    public MpesaPayment(String phoneNumber, String pin) {
        this.phoneNumber = phoneNumber;
        this.pin = pin;
    }

    @Override
    public boolean processPayment(double amount) {
        System.out.println("Processing M-Pesa payment of Ksh. " + amount);
        System.out.println("Phone Number: " + phoneNumber);
        
        // Simulate M-Pesa STK Push
        if (phoneNumber != null && phoneNumber.startsWith("254") && pin != null && pin.length() == 4) {
            System.out.println("📱 M-Pesa STK Push sent to " + phoneNumber);
            System.out.println("✅ M-Pesa payment successful!");
            return true;
        }
        
        System.out.println("❌ M-Pesa payment failed!");
        return false;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getPin() {
        return pin;
    }

    public void setPin(String pin) {
        this.pin = pin;
    }
}