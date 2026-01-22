package com.kenyamarket;

import com.kenyamarket.controllers.RegistrationController;

import io.javalin.Javalin;

public class Main {
    public static void main(String[] args) {
        
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
        app.get("/api/users", RegistrationController::getAllUsers); // For testing
        
        // Root redirect
        app.get("/", ctx -> ctx.redirect("/registration.html"));
    }
}