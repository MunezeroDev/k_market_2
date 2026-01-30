package com.kenyamarket.database;

import com.kenyamarket.models.User;
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
        ResultSet userRs = null;
        ResultSet roleRs = null;
        
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
            
            
            User user = new User();
            user.setUserId(userRs.getInt("userId"));
            user.setUserName(userRs.getString("userName"));
            user.setLastName(userRs.getString("lastName"));
            user.setEmail(userRs.getString("email"));
            user.setPhoneNo(userRs.getString("phoneNo"));
            user.setNationalId(userRs.getString("nationalId"));
            
            
            String roleQuery = "SELECT role FROM UserRole WHERE userId = ?";
            roleStmt = conn.prepareStatement(roleQuery);
            roleStmt.setInt(1, user.getUserId());
            roleRs = roleStmt.executeQuery();
            
            List<String> roles = new ArrayList<>();
            while (roleRs.next()) {
                roles.add(roleRs.getString("role"));
            }
            
            
            return new LoginResult(true, user, roles, "Login successful");
            
        } catch (SQLException e) {
            System.err.println("❌ Login error: " + e.getMessage());
            e.printStackTrace();
            return new LoginResult(false, null, null, "Database error occurred");
        } finally {
            
            try {
                if (roleRs != null) roleRs.close();
                if (userRs != null) userRs.close();
                if (roleStmt != null) roleStmt.close();
                if (userStmt != null) userStmt.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }
}