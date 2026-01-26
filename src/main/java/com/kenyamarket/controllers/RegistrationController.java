package com.kenyamarket.controllers;

import com.kenyamarket.models.User;
import com.kenyamarket.database.UserRepository;
import io.javalin.http.Context;
import java.util.HashMap;
import java.util.Map;

public class RegistrationController {

    public static void register(Context ctx) {
        try {
            // Parse the JSON body into a User object
            User user = ctx.bodyAsClass(User.class);
            
            // Validate the user data
            String validationError = validateUser(user);
            if (validationError != null) {
                ctx.status(400).json(createResponse(false, validationError));
                return;
            }
            
            // Check if username already exists
            if (UserRepository.userExists(user.getUsername())) {
                ctx.status(409).json(createResponse(false, "Username already exists"));
                return;
            }
            
            // Save the user to database
            boolean saved = UserRepository.saveUser(user);
            
            if (saved) {
                System.out.println("✅ New user registered: " + user.getUsername());
                ctx.status(201).json(createResponse(true, 
                    "Registration successful! Welcome " + user.getUsername()));
            } else {
                ctx.status(500).json(createResponse(false, 
                    "Failed to save user to database"));
            }
            
        } catch (Exception e) {
            System.err.println("Registration error: " + e.getMessage());
            e.printStackTrace();
            ctx.status(500).json(createResponse(false, 
                "Server error during registration"));
        }
    }
    
    private static String validateUser(User user) {
        if (user.getUsername() == null || user.getUsername().trim().isEmpty()) {
            return "Username is required";
        }
        if (user.getLastName() == null || user.getLastName().trim().isEmpty()) {
            return "Last name is required";
        }
        if (user.getPhoneNumber() == null || user.getPhoneNumber().trim().isEmpty()) {
            return "Phone number is required";
        }
        if (user.getPassword() == null || user.getPassword().length() < 6) {
            return "Password must be at least 6 characters";
        }
        if (user.getNationalId() == null || user.getNationalId().trim().isEmpty()) {
            return "National ID is required";
        }
        
        // Account type specific validation
        String accountType = user.getAccountType();
        if (accountType.equals("buyer")) {
            if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
                return "Email is required for buyers";
            }
            if (user.getDeliveryLocation() == null || user.getDeliveryLocation().trim().isEmpty()) {
                return "Delivery location is required for buyers";
            }
        }
        
        if (accountType.equals("seller")) {
            if (user.getBusinessName() == null || user.getBusinessName().trim().isEmpty()) {
                return "Business name is required for sellers";
            }
            if (user.getBusinessRegNumber() == null || user.getBusinessRegNumber().trim().isEmpty()) {
                return "Business registration number is required for sellers";
            }
            if (user.getBusinessLocation() == null || user.getBusinessLocation().trim().isEmpty()) {
                return "Business location is required for sellers";
            }
        }
        
        return null; // No errors
    }
    
    private static Map<String, Object> createResponse(boolean success, String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", success);
        response.put("message", message);
        return response;
    }
    
    // Method to get all users (for testing)
    public static void getAllUsers(Context ctx) {
        ctx.json(UserRepository.getAllUsers());
    }
}