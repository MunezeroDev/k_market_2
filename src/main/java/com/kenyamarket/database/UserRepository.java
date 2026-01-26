package com.kenyamarket.database;

import com.kenyamarket.models.User;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class UserRepository {

    public static boolean saveUser(User user) {
        Connection conn = null;
        try {
            conn = DatabaseConnection.getConnection();
            conn.setAutoCommit(false); // Start transaction

            // 1. Insert into User table
            String userSql = """
                INSERT INTO User (userName, lastName, email, phoneNo, password, nationalId)
                VALUES (?, ?, ?, ?, ?, ?)
            """;
            
            int userId;
            try (PreparedStatement pstmt = conn.prepareStatement(userSql, Statement.RETURN_GENERATED_KEYS)) {
                pstmt.setString(1, user.getUserName());
                pstmt.setString(2, user.getLastName());
                pstmt.setString(3, user.getEmail());
                pstmt.setString(4, user.getPhoneNo());
                pstmt.setString(5, user.getPassword());
                pstmt.setString(6, user.getNationalId());
                
                pstmt.executeUpdate();
                
                // Get the generated userId
                ResultSet rs = pstmt.getGeneratedKeys();
                if (rs.next()) {
                    userId = rs.getInt(1);
                } else {
                    throw new SQLException("Failed to get userId");
                }
            }

            // 2. Insert into UserRole table based on accountType
            String accountType = user.getAccountType().toLowerCase();
            if (accountType.equals("buyer")) {
                insertUserRole(conn, userId, "buyer");
            } else if (accountType.equals("seller")) {
                insertUserRole(conn, userId, "seller");
            }

            // 3. Insert into BuyerProfile if buyer or both
            if (accountType.equals("buyer")) {
                String buyerSql = """
                    INSERT INTO BuyerProfile (userId, deliveryLocation)
                    VALUES (?, ?)
                """;
                try (PreparedStatement pstmt = conn.prepareStatement(buyerSql)) {
                    pstmt.setInt(1, userId);
                    pstmt.setString(2, user.getDeliveryLocation());
                    pstmt.executeUpdate();
                }
            }

            // 4. Insert into SellerProfile if seller or both
            if (accountType.equals("seller")) {
                String sellerSql = """
                    INSERT INTO SellerProfile (userId, businessName, businessRegNumber, businessLocation)
                    VALUES (?, ?, ?, ?)
                """;
                try (PreparedStatement pstmt = conn.prepareStatement(sellerSql)) {
                    pstmt.setInt(1, userId);
                    pstmt.setString(2, user.getBusinessName());
                    pstmt.setString(3, user.getBusinessRegNumber());
                    pstmt.setString(4, user.getBusinessLocation());
                    pstmt.executeUpdate();
                }
            }

            conn.commit(); // Commit transaction
            System.out.println("✅ User saved with ID: " + userId);
            return true;

        } catch (SQLException e) {
            if (conn != null) {
                try {
                    conn.rollback(); // Rollback on error
                    System.err.println("Transaction rolled back");
                } catch (SQLException ex) {
                    ex.printStackTrace();
                }
            }
            System.err.println("Error saving user: " + e.getMessage());
            e.printStackTrace();
            return false;
        } finally {
            if (conn != null) {
                try {
                    conn.setAutoCommit(true);
                } catch (SQLException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    private static void insertUserRole(Connection conn, int userId, String role) throws SQLException {
        String sql = "INSERT INTO UserRole (userId, role) VALUES (?, ?)";
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, userId);
            pstmt.setString(2, role);
            pstmt.executeUpdate();
        }
    }

    public static boolean userExists(String userName) {
        String sql = "SELECT COUNT(*) FROM User WHERE userName = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, userName);
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
        String sql = """
            SELECT u.*, 
                   GROUP_CONCAT(ur.role) as roles,
                   bp.deliveryLocation,
                   sp.businessName, sp.businessRegNumber, sp.businessLocation
            FROM User u
            LEFT JOIN UserRole ur ON u.userId = ur.userId
            LEFT JOIN BuyerProfile bp ON u.userId = bp.userId
            LEFT JOIN SellerProfile sp ON u.userId = sp.userId
            GROUP BY u.userId
            ORDER BY u.createdAt DESC
        """;

        try (Connection conn = DatabaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                User user = new User();
                user.setUserId(rs.getInt("userId"));
                user.setUserName(rs.getString("userName"));
                user.setLastName(rs.getString("lastName"));
                user.setEmail(rs.getString("email"));
                user.setPhoneNo(rs.getString("phoneNo"));
                user.setPassword(rs.getString("password"));
                user.setNationalId(rs.getString("nationalId"));
                
                // Set roles
                String roles = rs.getString("roles");
                user.setAccountType(roles);
                
                user.setDeliveryLocation(rs.getString("deliveryLocation"));
                user.setBusinessName(rs.getString("businessName"));
                user.setBusinessRegNumber(rs.getString("businessRegNumber"));
                user.setBusinessLocation(rs.getString("businessLocation"));
                
                users.add(user);
            }

        } catch (SQLException e) {
            System.err.println("Error fetching users: " + e.getMessage());
            e.printStackTrace();
        }

        return users;
    }
}