package com.kenyamarket.database;

import com.kenyamarket.models.User;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class UserRepository {

    public static boolean saveUser(User user) {
        String sql = """
            INSERT INTO users (
                account_type, username, last_name, email, phone_number, 
                password, national_id, delivery_location, business_name, 
                business_reg_number, business_location
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """;

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, user.getAccountType());
            pstmt.setString(2, user.getUsername());
            pstmt.setString(3, user.getLastName());
            pstmt.setString(4, user.getEmail());
            pstmt.setString(5, user.getPhoneNumber());
            pstmt.setString(6, user.getPassword());
            pstmt.setString(7, user.getNationalId());
            pstmt.setString(8, user.getDeliveryLocation());
            pstmt.setString(9, user.getBusinessName());
            pstmt.setString(10, user.getBusinessRegNumber());
            pstmt.setString(11, user.getBusinessLocation());

            int rowsAffected = pstmt.executeUpdate();
            return rowsAffected > 0;

        } catch (SQLException e) {
            System.err.println("Error saving user: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    public static boolean userExists(String username) {
        String sql = "SELECT COUNT(*) FROM users WHERE username = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, username);
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return rs.getInt(1) > 0;
            }

        } catch (SQLException e) {
            System.err.println("Error checking user existence: " + e.getMessage());
        }

        return false;
    }

    public static List<User> getAllUsers() {
        List<User> users = new ArrayList<>();
        String sql = "SELECT * FROM users ORDER BY created_at DESC";

        try (Connection conn = DatabaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                User user = new User();
                user.setAccountType(rs.getString("account_type"));
                user.setUsername(rs.getString("username"));
                user.setLastName(rs.getString("last_name"));
                user.setEmail(rs.getString("email"));
                user.setPhoneNumber(rs.getString("phone_number"));
                user.setPassword(rs.getString("password"));
                user.setNationalId(rs.getString("national_id"));
                user.setDeliveryLocation(rs.getString("delivery_location"));
                user.setBusinessName(rs.getString("business_name"));
                user.setBusinessRegNumber(rs.getString("business_reg_number"));
                user.setBusinessLocation(rs.getString("business_location"));
                users.add(user);
            }

        } catch (SQLException e) {
            System.err.println("Error fetching users: " + e.getMessage());
        }

        return users;
    }
}