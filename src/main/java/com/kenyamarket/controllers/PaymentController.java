package com.kenyamarket.controllers;

import com.google.gson.Gson;
import com.kenyamarket.payments.*;
import com.kenyamarket.utils.SessionManager;
import io.javalin.http.Context;

import java.util.HashMap;
import java.util.Map;

public class PaymentController {
    private static final Gson gson = new Gson();

    public static void processPayment(Context ctx) {
        String sessionId = ctx.cookie("sessionId");
        SessionManager.SessionData sessionData = SessionManager.getSession(sessionId);

        if (sessionData == null) {
            ctx.status(401).json("{\"error\": \"Unauthorized\"}");
            return;
        }

        try {
            Map<String, Object> requestData = gson.fromJson(ctx.body(), Map.class);
            
            String paymentMethod = (String) requestData.get("paymentMethod");
            double amount = ((Number) requestData.get("amount")).doubleValue();

            ShoppingCart cart = new ShoppingCart();
            PaymentStrategy strategy = null;

            cart.setPaymentStrategy(new MpesaPayment("254712345678", "1234"));
            cart.checkOut(500.0);

            cart.setPaymentStrategy(new CreditCardPayment("1234567890123456", "123"));
            cart.checkOut(500.0);

            cart.setPaymentStrategy(new PayPalPayment("user@email.com", "password"));
            cart.checkOut(500.0);
            

            switch (paymentMethod.toLowerCase()) {
                case "creditcard":
                    String cardNumber = (String) requestData.get("cardNumber");
                    String cvv = (String) requestData.get("cvv");
                    strategy = new CreditCardPayment(cardNumber, cvv);
                    break;

                case "mpesa":
                    String phoneNumber = (String) requestData.get("phoneNumber");
                    String pin = (String) requestData.get("pin");
                    strategy = new MpesaPayment(phoneNumber, pin);
                    break;

                case "paypal":
                    String email = (String) requestData.get("email");
                    String password = (String) requestData.get("password");
                    strategy = new PayPalPayment(email, password);
                    break;

                default:
                    ctx.status(400).json("{\"error\": \"Invalid payment method\"}");
                    return;
            }

            cart.setPaymentStrategy(strategy);
            boolean success = cart.checkOut(amount);

            Map<String, Object> response = new HashMap<>();
            response.put("success", success);
            response.put("message", success ? "Payment processed successfully" : "Payment failed");
            response.put("amount", amount);
            response.put("paymentMethod", paymentMethod);

            if (success) {
                ctx.status(200).json(gson.toJson(response));
            } else {
                ctx.status(400).json(gson.toJson(response));
            }

        } catch (Exception e) {
            e.printStackTrace();
            ctx.status(400).json("{\"error\": \"Invalid payment request: " + e.getMessage() + "\"}");
        }
    }
}