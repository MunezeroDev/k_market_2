package com.kenyamarket;

import com.kenyamarket.controllers.RegistrationController;
import com.kenyamarket.database.DatabaseConnection;
import io.javalin.Javalin;

public class Main {
    public static void main(String[] args) {
        
        // Initialize database
        System.out.println("🔧 Initializing database...");
        DatabaseConnection.initializeDatabase();
        DatabaseConnection.testConnection();
        
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

        // API Routes
        app.post("/api/register", RegistrationController::register);
        app.get("/api/users", RegistrationController::getAllUsers);
        
        // Root redirect
        app.get("/", ctx -> ctx.redirect("/registration.html"));
        
        // Shutdown hook to close database connection
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            DatabaseConnection.closeConnection();
            System.out.println("👋 Server shutdown complete");
        }));
    }
}