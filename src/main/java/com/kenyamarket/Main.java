package com.kenyamarket;

import com.kenyamarket.controllers.RegistrationController;
import com.kenyamarket.database.DatabaseConnection;
import com.kenyamarket.controllers.LoginController;
import com.kenyamarket.filters.SessionFilter;
import com.kenyamarket.utils.SessionManager;
import io.javalin.Javalin;
import com.google.gson.Gson;
import java.util.HashMap;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        
        // Initialize database
        System.out.println("🔧 Initializing database...");
        DatabaseConnection.initializeDatabase();
        DatabaseConnection.testConnection();
        LoginController loginController = new LoginController();
        Gson gson = new Gson();
        
        Javalin app = Javalin.create(config -> {
            // Serve static files from resources/public
            config.staticFiles.add("/public");
            
            // Enable CORS for development
            config.plugins.enableCors(cors -> {
                cors.add(it -> it.anyHost());
            });
            
        }).start(7070);

        System.out.println("🚀 KenyaMarket server started on http://localhost:7070");
        System.out.println("📝 Registration page: http://localhost:7070/registration.html");
        System.out.println("🔐 Login page: http://localhost:7070/login.html");

        // PUBLIC Routes (no authentication required)
        app.post("/api/register", RegistrationController::register);
        app.post("/api/login", loginController::handleLogin);
        app.post("/api/logout", loginController::handleLogout);
        
        // PROTECTED Routes (authentication required)
        app.get("/api/users", ctx -> {
            SessionFilter.requireAuth(ctx);
            RegistrationController.getAllUsers(ctx);
        });
        
        // API endpoint to check session status
        app.get("/api/session/check", ctx -> {
            String sessionId = ctx.cookie("sessionId");
            SessionManager.SessionData sessionData = SessionManager.getSession(sessionId);
            
            if (sessionData != null) {
                ctx.json("{\"authenticated\": true, \"user\": \"" + sessionData.getUser().getUserName() + "\"}");
            } else {
                ctx.json("{\"authenticated\": false}");
            }
        });
        
        // API endpoint to get current user info with roles (protected)
        app.get("/api/user/me", ctx -> {
            SessionFilter.requireAuth(ctx);
            
            String sessionId = ctx.cookie("sessionId");
            SessionManager.SessionData sessionData = SessionManager.getSession(sessionId);
            
            if (sessionData != null) {
                // Create response with user and roles
                Map<String, Object> response = new HashMap<>();
                response.put("user", sessionData.getUser());
                response.put("roles", sessionData.roles());
                
                ctx.json(gson.toJson(response));
            }
        });
        
        // Root redirect
        app.get("/", ctx -> ctx.redirect("/login.html"));
        
        // Shutdown hook to close database connection
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            DatabaseConnection.closeConnection();
            System.out.println("👋 Server shutdown complete");
        }));
    }
}