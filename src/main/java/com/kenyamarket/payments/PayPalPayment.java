package com.kenyamarket.payments;

public class PayPalPayment implements PaymentStrategy {
    private String email;
    private String password;

    public PayPalPayment(String email, String password) {
        this.email = email;
        this.password = password;
    }

    @Override
    public boolean processPayment(double amount) {
        System.out.println("Processing PayPal payment of Ksh. " + amount);
        System.out.println("PayPal Email: " + email);
        
        // Simulate PayPal authentication
        if (email != null && email.contains("@") && password != null && !password.isEmpty()) {
            System.out.println("✅ PayPal payment successful!");
            return true;
        }
        
        System.out.println("❌ PayPal payment failed!");
        return false;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}