package com.kenyamarket.database;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

public class DatabaseConnection {
    private static final String DB_URL = "jdbc:mysql://localhost:3306/kenyamarket";
    private static final String DB_USER = "root";  // 
    private static final String DB_PASSWORD = "TryingJavalin$14db";  
    private static Connection connection = null;

    public static Connection getConnection() {
        try {
            if (connection == null || connection.isClosed()) {
                connection = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD);
                
            }
            return connection;
        } catch (SQLException e) {
            
            e.printStackTrace();
            return null;
        }
    }

    public static void initializeDatabase() {
        try (Connection conn = getConnection();
            Statement stmt = conn.createStatement()) {

            
            String createUserTable = """
                CREATE TABLE IF NOT EXISTS User (
                    userId INT PRIMARY KEY AUTO_INCREMENT,
                    userName VARCHAR(100) UNIQUE NOT NULL,
                    lastName VARCHAR(100) NOT NULL,
                    email VARCHAR(150),
                    phoneNo VARCHAR(20) NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    nationalId VARCHAR(50) NOT NULL,
                    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """;

            
            String createUserRoleTable = """
                CREATE TABLE IF NOT EXISTS UserRole (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    userId INT NOT NULL,
                    role ENUM('buyer', 'seller', 'admin') NOT NULL,
                    FOREIGN KEY (userId) REFERENCES User(userId) ON DELETE CASCADE,
                    UNIQUE KEY unique_user_role (userId, role)
                )
            """;

            
            String createBuyerProfileTable = """
                CREATE TABLE IF NOT EXISTS BuyerProfile (
                    userId INT PRIMARY KEY,
                    deliveryLocation VARCHAR(255) NOT NULL,
                    FOREIGN KEY (userId) REFERENCES User(userId) ON DELETE CASCADE
                )
            """;

            
            String createSellerProfileTable = """
                CREATE TABLE IF NOT EXISTS SellerProfile (
                    userId INT PRIMARY KEY,
                    businessName VARCHAR(150) NOT NULL,
                    businessRegNumber VARCHAR(100) NOT NULL,
                    businessLocation VARCHAR(255) NOT NULL,
                    FOREIGN KEY (userId) REFERENCES User(userId) ON DELETE CASCADE
                )
            """;

            
            String createProductTable = """
                CREATE TABLE IF NOT EXISTS Product (
                    productId INT PRIMARY KEY AUTO_INCREMENT,
                    sellerId INT NOT NULL,
                    productName VARCHAR(255) NOT NULL,
                    description TEXT NOT NULL,
                    price DECIMAL(10, 2) NOT NULL,
                    quantity INT NOT NULL DEFAULT 0,
                    category VARCHAR(100),
                    status ENUM('active', 'inactive', 'out_of_stock') DEFAULT 'active',
                    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (sellerId) REFERENCES User(userId) ON DELETE CASCADE
                )
            """;

                
            String createProductImageTable = """
                CREATE TABLE IF NOT EXISTS ProductImage (
                    imageId INT PRIMARY KEY AUTO_INCREMENT,
                    productId INT NOT NULL,
                    imageData LONGTEXT NOT NULL,
                    isPrimary BOOLEAN DEFAULT FALSE,
                    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (productId) REFERENCES Product(productId) ON DELETE CASCADE
                )
            """;

            stmt.execute(createUserTable);
            stmt.execute(createUserRoleTable);
            stmt.execute(createBuyerProfileTable);
            stmt.execute(createSellerProfileTable);
            stmt.execute(createProductTable);
            stmt.execute(createProductImageTable);
            
            
            System.out.println("✅ Database tables initialized: User, UserRole, BuyerProfile, SellerProfile, Product, ProductImage");

        } catch (SQLException e) {
            
            e.printStackTrace();
        }
    }
    
    public static void testConnection() {
        try (Connection conn = getConnection()) {
            if (conn != null && !conn.isClosed()) {
                
            } else {
                
            }
        } catch (SQLException e) {
            
            e.printStackTrace();
        }
    }

    public static void closeConnection() {
        try {
            if (connection != null && !connection.isClosed()) {
                connection.close();
                
            }
        } catch (SQLException e) {
            System.err.println("Error closing database: " + e.getMessage());
        }
    }
}