package com.kenyamarket.controllers;

import com.google.gson.Gson;
import com.kenyamarket.database.ProductRepository;
import com.kenyamarket.models.Product;
import com.kenyamarket.utils.SessionManager;
import io.javalin.http.Context;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ProductController {
    private static final Gson gson = new Gson();
    
    
    public static void getSellerProducts(Context ctx) {
        String sessionId = ctx.cookie("sessionId");
        SessionManager.SessionData sessionData = SessionManager.getSession(sessionId);
        
        if (sessionData == null) {
            ctx.status(401).json("{\"error\": \"Unauthorized\"}");
            return;
        }
        
        int sellerId = sessionData.getUser().getUserId();
        List<Product> products = ProductRepository.getProductsBySeller(sellerId);
        
        
        for (Product product : products) {
            List<String> images = ProductRepository.getProductImages(product.getProductId());
            product.setImages(images);
        }
        
        ctx.json(gson.toJson(products));
    }

    
    public static void getAllProducts(Context ctx) {
        List<Product> products = ProductRepository.getAllProducts();
        
        
        for (Product product : products) {
            List<String> images = ProductRepository.getProductImages(product.getProductId());
            product.setImages(images);
        }
        
        ctx.json(gson.toJson(products));
    }
  
    
    
    public static void addProduct(Context ctx) {
        String sessionId = ctx.cookie("sessionId");
        SessionManager.SessionData sessionData = SessionManager.getSession(sessionId);
        
        if (sessionData == null) {
            ctx.status(401).json("{\"error\": \"Unauthorized\"}");
            return;
        }
        
        if (!sessionData.roles().contains("seller")) {
            ctx.status(403).json("{\"error\": \"Seller role required\"}");
            return;
        }
        
        try {
            
            Map<String, Object> requestData = gson.fromJson(ctx.body(), Map.class);
            
            
            Product product = new Product();
            product.setSellerId(sessionData.getUser().getUserId());
            product.setProductName((String) requestData.get("productName"));
            product.setDescription((String) requestData.get("description"));
            product.setPrice(new BigDecimal(requestData.get("price").toString()));
            product.setQuantity(((Double) requestData.get("quantity")).intValue());
            product.setCategory((String) requestData.get("category"));
            product.setStatus("active");
            
            
            List<String> images = (List<String>) requestData.get("images");
            
            
            int productId = ProductRepository.saveProduct(product, images);
            
            if (productId > 0) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("productId", productId);
                response.put("message", "Product added successfully");
                ctx.json(gson.toJson(response));
            } else {
                ctx.status(500).json("{\"error\": \"Failed to save product\"}");
            }
            
        } catch (Exception e) {
            e.printStackTrace();
            ctx.status(400).json("{\"error\": \"Invalid request: " + e.getMessage() + "\"}");
        }
    }
    
    
    public static void deleteProduct(Context ctx) {
        String sessionId = ctx.cookie("sessionId");
        SessionManager.SessionData sessionData = SessionManager.getSession(sessionId);
        
        if (sessionData == null) {
            ctx.status(401).json("{\"error\": \"Unauthorized\"}");
            return;
        }
        
        try {
            int productId = Integer.parseInt(ctx.pathParam("id"));
            int sellerId = sessionData.getUser().getUserId();
            
            boolean deleted = ProductRepository.deleteProduct(productId, sellerId);
            
            if (deleted) {
                ctx.json("{\"success\": true, \"message\": \"Product deleted\"}");
            } else {
                ctx.status(404).json("{\"error\": \"Product not found or unauthorized\"}");
            }
            
        } catch (Exception e) {
            ctx.status(400).json("{\"error\": \"Invalid request\"}");
        }
    }
    
    
    public static void updateProduct(Context ctx) {
        String sessionId = ctx.cookie("sessionId");
        SessionManager.SessionData sessionData = SessionManager.getSession(sessionId);
        
        if (sessionData == null) {
            ctx.status(401).json("{\"error\": \"Unauthorized\"}");
            return;
        }
        
        try {
            int productId = Integer.parseInt(ctx.pathParam("id"));
            Map<String, Object> requestData = gson.fromJson(ctx.body(), Map.class);
            
            Product product = new Product();
            product.setProductId(productId);
            product.setSellerId(sessionData.getUser().getUserId());
            product.setProductName((String) requestData.get("productName"));
            product.setDescription((String) requestData.get("description"));
            product.setPrice(new BigDecimal(requestData.get("price").toString()));
            product.setQuantity(((Double) requestData.get("quantity")).intValue());
            product.setCategory((String) requestData.get("category"));
            product.setStatus((String) requestData.get("status"));
            
            boolean updated = ProductRepository.updateProduct(product);
            
            if (updated) {
                ctx.json("{\"success\": true, \"message\": \"Product updated\"}");
            } else {
                ctx.status(404).json("{\"error\": \"Product not found or unauthorized\"}");
            }
            
        } catch (Exception e) {
            e.printStackTrace();
            ctx.status(400).json("{\"error\": \"Invalid request: " + e.getMessage() + "\"}");
        }
    }
}