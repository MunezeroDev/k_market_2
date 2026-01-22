package com.kenyamarket.database;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

public class DatabaseConnection {
    private static final String DB_URL = "jdbc:mysql://localhost:3306/kenyamarket";
    private static final String DB_USER = "root";  // ← CHANGE THIS
    private static final String DB_PASSWORD = "TryingJavalin$14db";  // ← CHANGE THIS
    private static Connection connection = null;

    public static Connection getConnection() {
        try {
            if (connection == null || connection.isClosed()) {
                connection = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD);
                System.out.println("✅ Database connection established");
            }
            return connection;
        } catch (SQLException e) {
            System.err.println("❌ Database connection failed: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    public static void initializeDatabase() {
        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement()) {

            // Create users table
            String createTableSQL = """
                CREATE TABLE IF NOT EXISTS users (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    account_type VARCHAR(50) NOT NULL,
                    username VARCHAR(100) UNIQUE NOT NULL,
                    last_name VARCHAR(100) NOT NULL,
                    email VARCHAR(150),
                    phone_number VARCHAR(20) NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    national_id VARCHAR(50) NOT NULL,
                    delivery_location VARCHAR(255),
                    business_name VARCHAR(150),
                    business_reg_number VARCHAR(100),
                    business_location VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """;

            stmt.execute(createTableSQL);
            System.out.println("✅ Database table 'users' initialized");

        } catch (SQLException e) {
            System.err.println("❌ Database initialization failed: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public static void testConnection() {
        try (Connection conn = getConnection()) {
            if (conn != null && !conn.isClosed()) {
                System.out.println("🎉 Database connection test: SUCCESS");
            } else {
                System.out.println("❌ Database connection test: FAILED");
            }
        } catch (SQLException e) {
            System.out.println("❌ Database connection test: FAILED");
            e.printStackTrace();
        }
    }

    public static void closeConnection() {
        try {
            if (connection != null && !connection.isClosed()) {
                connection.close();
                System.out.println("Database connection closed");
            }
        } catch (SQLException e) {
            System.err.println("Error closing database: " + e.getMessage());
        }
    }
}