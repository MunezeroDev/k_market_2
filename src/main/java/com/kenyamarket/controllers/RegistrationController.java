package com.kenyamarket.controllers;

import com.kenyamarket.models.User;
import com.kenyamarket.models.Buyer;
import com.kenyamarket.models.Seller;
import com.kenyamarket.models.Admin;
import com.kenyamarket.database.UserRepository;
import io.javalin.http.Context;
import com.google.gson.Gson;
import java.util.HashMap;
import java.util.Map;

public class RegistrationController {

	private static final Gson gson = new Gson();

	public static void register(Context ctx) {
		try {
			Map<String, Object> body = gson.fromJson(ctx.body(), Map.class);
			String accountType = (String) body.get("accountType");

			if (accountType == null || accountType.trim().isEmpty()) {
				ctx.status(400).json(createResponse(false, "Account type is required"));
				return;
			}

			User user;

			if (accountType.equalsIgnoreCase("buyer")) {
				Buyer buyer = new Buyer();
				buyer.setDeliveryLocation((String) body.get("deliveryLocation"));
				user = buyer;
			} else if (accountType.equalsIgnoreCase("seller")) {
				Seller seller = new Seller();
				seller.setBusinessName((String) body.get("businessName"));
				seller.setBusinessRegNumber((String) body.get("businessRegNumber"));
				seller.setBusinessLocation((String) body.get("businessLocation"));
				user = seller;
			} else if (accountType.equalsIgnoreCase("admin")) {
				user = new Admin();
			} else {
				ctx.status(400).json(createResponse(false, "Invalid account type"));
				return;
			}
			
			user.setUserName((String) body.get("username"));      
			user.setLastName((String) body.get("lastName"));      
			user.setEmail((String) body.get("email"));           
			user.setPhoneNo((String) body.get("phoneNumber"));    
			user.setPassword((String) body.get("password"));      
			user.setNationalId((String) body.get("nationalId"));  

			String validationError = validateUser(user);
			if (validationError != null) {
				ctx.status(400).json(createResponse(false, validationError));
				return;
			}

			if (UserRepository.userExists(user.getUserName())) {
				ctx.status(409).json(createResponse(false, "Username already exists"));
				return;
			}

			boolean saved = UserRepository.saveUser(user);

			if (saved) {
				System.out.println("✅ New user registered: " + user.getUserName());
				ctx.status(201).json(createResponse(true, "Registration successful! Welcome " + user.getUserName()));
			} else {
				ctx.status(500).json(createResponse(false, "Failed to save user to database"));
			}

		} catch (Exception e) {
			System.err.println("Registration error: " + e.getMessage());
			e.printStackTrace();
			ctx.status(500).json(createResponse(false, "Server error during registration"));
		}
	}

	private static String validateUser(User user) {
		if (user.getUserName() == null || user.getUserName().trim().isEmpty()) {
			return "Username is required";
		}
		if (user.getLastName() == null || user.getLastName().trim().isEmpty()) {
			return "Last name is required";
		}
		if (user.getPhoneNo() == null || user.getPhoneNo().trim().isEmpty()) {
			return "Phone number is required";
		}
		if (user.getPassword() == null || user.getPassword().length() < 6) {
			return "Password must be at least 6 characters";
		}
		if (user.getNationalId() == null || user.getNationalId().trim().isEmpty()) {
			return "National ID is required";
		}

		if (user instanceof Buyer) {
			Buyer buyer = (Buyer) user;
			if (buyer.getEmail() == null || buyer.getEmail().trim().isEmpty()) {
				return "Email is required for buyers";
			}
			if (buyer.getDeliveryLocation() == null || buyer.getDeliveryLocation().trim().isEmpty()) {
				return "Delivery location is required for buyers";
			}
		}

		if (user instanceof Seller) {
			Seller seller = (Seller) user;
			if (seller.getBusinessName() == null || seller.getBusinessName().trim().isEmpty()) {
				return "Business name is required for sellers";
			}
			if (seller.getBusinessRegNumber() == null || seller.getBusinessRegNumber().trim().isEmpty()) {
				return "Business registration number is required for sellers";
			}
			if (seller.getBusinessLocation() == null || seller.getBusinessLocation().trim().isEmpty()) {
				return "Business location is required for sellers";
			}
		}

		return null;
	}

	private static Map<String, Object> createResponse(boolean success, String message) {
		Map<String, Object> response = new HashMap<>();
		response.put("success", success);
		response.put("message", message);
		return response;
	}

	public static void getAllUsers(Context ctx) {
		ctx.json(UserRepository.getAllUsers());
	}
}