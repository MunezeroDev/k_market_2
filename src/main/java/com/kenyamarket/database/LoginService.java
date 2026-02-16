package com.kenyamarket.database;

import com.kenyamarket.models.User;
import com.kenyamarket.models.Buyer;
import com.kenyamarket.models.Seller;
import com.kenyamarket.models.Admin;
import com.kenyamarket.models.LoginResult;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class LoginService {

	public LoginResult login(String userName, String password) {
		Connection conn = null;
		PreparedStatement userStmt = null;
		PreparedStatement roleStmt = null;
		PreparedStatement buyerStmt = null;
		PreparedStatement sellerStmt = null;
		ResultSet userRs = null;
		ResultSet roleRs = null;
		ResultSet buyerRs = null;
		ResultSet sellerRs = null;

		try {
			conn = DatabaseConnection.getConnection();

			String userQuery = "SELECT * FROM User WHERE userName = ? AND password = ?";
			userStmt = conn.prepareStatement(userQuery);
			userStmt.setString(1, userName);
			userStmt.setString(2, password);
			userRs = userStmt.executeQuery();

			if (!userRs.next()) {
				return new LoginResult(false, null, null, "Invalid username or password");
			}

			int userId = userRs.getInt("userId");

			String roleQuery = "SELECT role FROM UserRole WHERE userId = ?";
			roleStmt = conn.prepareStatement(roleQuery);
			roleStmt.setInt(1, userId);
			roleRs = roleStmt.executeQuery();

			List<String> roles = new ArrayList<>();
			while (roleRs.next()) {
				roles.add(roleRs.getString("role"));
			}

			User user;

			if (roles.contains("buyer")) {
				Buyer buyer = new Buyer();
				
				String buyerQuery = "SELECT deliveryLocation FROM BuyerProfile WHERE userId = ?";
				buyerStmt = conn.prepareStatement(buyerQuery);
				buyerStmt.setInt(1, userId);
				buyerRs = buyerStmt.executeQuery();
				
				if (buyerRs.next()) {
					buyer.setDeliveryLocation(buyerRs.getString("deliveryLocation"));
				}
				
				user = buyer;
			} 
			else if (roles.contains("seller")) {
				Seller seller = new Seller();
				
				String sellerQuery = "SELECT businessName, businessRegNumber, businessLocation FROM SellerProfile WHERE userId = ?";
				sellerStmt = conn.prepareStatement(sellerQuery);
				sellerStmt.setInt(1, userId);
				sellerRs = sellerStmt.executeQuery();
				
				if (sellerRs.next()) {
					seller.setBusinessName(sellerRs.getString("businessName"));
					seller.setBusinessRegNumber(sellerRs.getString("businessRegNumber"));
					seller.setBusinessLocation(sellerRs.getString("businessLocation"));
				}
				
				user = seller;
			} 
			else {
				user = new Admin();
			}

			user.setUserId(userId);
			user.setUserName(userRs.getString("userName"));
			user.setLastName(userRs.getString("lastName"));
			user.setEmail(userRs.getString("email"));
			user.setPhoneNo(userRs.getString("phoneNo"));
			user.setNationalId(userRs.getString("nationalId"));

			return new LoginResult(true, user, roles, "Login successful");

		} catch (SQLException e) {
			System.err.println("❌ Login error: " + e.getMessage());
			e.printStackTrace();
			return new LoginResult(false, null, null, "Database error occurred");
		} finally {
			try {
				if (sellerRs != null) sellerRs.close();
				if (buyerRs != null) buyerRs.close();
				if (roleRs != null) roleRs.close();
				if (userRs != null) userRs.close();
				if (sellerStmt != null) sellerStmt.close();
				if (buyerStmt != null) buyerStmt.close();
				if (roleStmt != null) roleStmt.close();
				if (userStmt != null) userStmt.close();
			} catch (SQLException e) {
				e.printStackTrace();
			}
		}
	}
}