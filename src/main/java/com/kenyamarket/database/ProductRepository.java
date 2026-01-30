package com.kenyamarket.database;

import com.kenyamarket.models.Product;
import com.kenyamarket.models.ProductImage;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ProductRepository {
    
    
    public static int saveProduct(Product product, List<String> imageDataList) {
        Connection conn = null;
        PreparedStatement productStmt = null;
        PreparedStatement imageStmt = null;
        ResultSet generatedKeys = null;
        
        try {
            conn = DatabaseConnection.getConnection();
            conn.setAutoCommit(false); 
            
            
            String productSql = """
                INSERT INTO Product (sellerId, productName, description, price, quantity, category, status)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """;
            
            productStmt = conn.prepareStatement(productSql, Statement.RETURN_GENERATED_KEYS);
            productStmt.setInt(1, product.getSellerId());
            productStmt.setString(2, product.getProductName());
            productStmt.setString(3, product.getDescription());
            productStmt.setBigDecimal(4, product.getPrice());
            productStmt.setInt(5, product.getQuantity());
            productStmt.setString(6, product.getCategory());
            productStmt.setString(7, product.getStatus());
            
            productStmt.executeUpdate();
            
            
            generatedKeys = productStmt.getGeneratedKeys();
            int productId = -1;
            if (generatedKeys.next()) {
                productId = generatedKeys.getInt(1);
            } else {
                throw new SQLException("Failed to get productId");
            }
            
            
            if (imageDataList != null && !imageDataList.isEmpty()) {
                String imageSql = """
                    INSERT INTO ProductImage (productId, imageData, isPrimary)
                    VALUES (?, ?, ?)
                """;
                
                imageStmt = conn.prepareStatement(imageSql);
                
                for (int i = 0; i < imageDataList.size(); i++) {
                    imageStmt.setInt(1, productId);
                    imageStmt.setString(2, imageDataList.get(i));
                    imageStmt.setBoolean(3, i == 0); 
                    imageStmt.addBatch();
                }
                
                imageStmt.executeBatch();
            }
            
            conn.commit();
            System.out.println("✅ Product saved with ID: " + productId);
            return productId;
            
        } catch (SQLException e) {
            if (conn != null) {
                try {
                    conn.rollback();
                    System.err.println("Transaction rolled back");
                } catch (SQLException ex) {
                    ex.printStackTrace();
                }
            }
            System.err.println("Error saving product: " + e.getMessage());
            e.printStackTrace();
            return -1;
        } finally {
            try {
                if (generatedKeys != null) generatedKeys.close();
                if (imageStmt != null) imageStmt.close();
                if (productStmt != null) productStmt.close();
                if (conn != null) conn.setAutoCommit(true);
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    
    public static List<String> getProductImages(int productId) {
        List<String> images = new ArrayList<>();
        String sql = "SELECT imageData FROM ProductImage WHERE productId = ? ORDER BY isPrimary DESC";
        
        try (Connection conn = DatabaseConnection.getConnection();
            PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setInt(1, productId);
            ResultSet rs = pstmt.executeQuery();
            
            while (rs.next()) {
                images.add(rs.getString("imageData"));
            }
            
        } catch (SQLException e) {
            System.err.println("Error fetching images: " + e.getMessage());
            e.printStackTrace();
        }
        
        return images;
    }
        
    
    public static List<Product> getProductsBySeller(int sellerId) {
        List<Product> products = new ArrayList<>();
        String sql = "SELECT * FROM Product WHERE sellerId = ? ORDER BY createdAt DESC";
        
        try (Connection conn = DatabaseConnection.getConnection();
            PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setInt(1, sellerId);
            ResultSet rs = pstmt.executeQuery();
            
            while (rs.next()) {
                Product product = new Product();
                product.setProductId(rs.getInt("productId"));
                product.setSellerId(rs.getInt("sellerId"));
                product.setProductName(rs.getString("productName"));
                product.setDescription(rs.getString("description"));
                product.setPrice(rs.getBigDecimal("price"));
                product.setQuantity(rs.getInt("quantity"));
                product.setCategory(rs.getString("category"));
                product.setStatus(rs.getString("status"));
                product.setCreatedAt(rs.getTimestamp("createdAt"));
                product.setUpdatedAt(rs.getTimestamp("updatedAt"));
                
                products.add(product);
            }
            
        } catch (SQLException e) {
            System.err.println("Error fetching products: " + e.getMessage());
            e.printStackTrace();
        }
        
        return products;
    }

    
    public static List<Product> getAllProducts() {
        List<Product> products = new ArrayList<>();
        String sql = "SELECT * FROM Product WHERE status = 'active' ORDER BY createdAt DESC";
        
        try (Connection conn = DatabaseConnection.getConnection();
            PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            ResultSet rs = pstmt.executeQuery();
            
            while (rs.next()) {
                Product product = new Product();
                product.setProductId(rs.getInt("productId"));
                product.setSellerId(rs.getInt("sellerId"));
                product.setProductName(rs.getString("productName"));
                product.setDescription(rs.getString("description"));
                product.setPrice(rs.getBigDecimal("price"));
                product.setQuantity(rs.getInt("quantity"));
                product.setCategory(rs.getString("category"));
                product.setStatus(rs.getString("status"));
                product.setCreatedAt(rs.getTimestamp("createdAt"));
                product.setUpdatedAt(rs.getTimestamp("updatedAt"));
                
                products.add(product);
            }
            
        } catch (SQLException e) {
            System.err.println("Error fetching all products: " + e.getMessage());
            e.printStackTrace();
        }
        
        return products;
    }
    
    
    public static boolean deleteProduct(int productId, int sellerId) {
        String sql = "DELETE FROM Product WHERE productId = ? AND sellerId = ?";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setInt(1, productId);
            pstmt.setInt(2, sellerId); 
            
            int rowsAffected = pstmt.executeUpdate();
            
            if (rowsAffected > 0) {
                System.out.println("✅ Product deleted: " + productId);
                return true;
            } else {
                System.out.println("❌ Product not found or unauthorized: " + productId);
                return false;
            }
            
        } catch (SQLException e) {
            System.err.println("Error deleting product: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    
    
    
    public static boolean updateProduct(Product product) {
        String sql = """
            UPDATE Product 
            SET productName = ?, description = ?, price = ?, quantity = ?, category = ?, status = ?
            WHERE productId = ? AND sellerId = ?
        """;
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, product.getProductName());
            pstmt.setString(2, product.getDescription());
            pstmt.setBigDecimal(3, product.getPrice());
            pstmt.setInt(4, product.getQuantity());
            pstmt.setString(5, product.getCategory());
            pstmt.setString(6, product.getStatus());
            pstmt.setInt(7, product.getProductId());
            pstmt.setInt(8, product.getSellerId()); 
            
            int rowsAffected = pstmt.executeUpdate();
            
            if (rowsAffected > 0) {
                System.out.println("✅ Product updated: " + product.getProductId());
                return true;
            } else {
                System.out.println("❌ Product not found or unauthorized");
                return false;
            }
            
        } catch (SQLException e) {
            System.err.println("Error updating product: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
}