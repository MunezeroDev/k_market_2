package com.kenyamarket.controllers;

import com.kenyamarket.database.LoginService;
import com.kenyamarket.models.LoginResult;
import com.kenyamarket.utils.SessionManager;
import io.javalin.http.Context;
import com.google.gson.Gson;

public class LoginController {
    
    private LoginService loginService;
    private Gson gson;
    
    public LoginController() {
        this.loginService = new LoginService();
        this.gson = new Gson();
    }
    
    public void handleLogin(Context ctx) {
        // Get username and password from request
        String userName = ctx.formParam("userName");
        String password = ctx.formParam("password");
        
        // Validate input
        if (userName == null || userName.isEmpty() || password == null || password.isEmpty()) {
            ctx.status(400).json(gson.toJson(new LoginResult(false, null, null, "Username and password are required")));
            return;
        }
        
        // Attempt login
        LoginResult result = loginService.login(userName, password);
        
        // Return result
        if (result.isSuccess()) {
            // Create session for the user
            String sessionId = SessionManager.createSession(result.getUser(), result.getRoles());
            
            // Set session cookie
            ctx.cookie("sessionId", sessionId, 30 * 60); // 30 minutes
            
            ctx.status(200).json(gson.toJson(result));
            System.out.println("✅ User logged in: " + userName + " with roles: " + result.getRoles());
        } else {
            ctx.status(401).json(gson.toJson(result));
            System.out.println("❌ Login failed for: " + userName);
        }
    }
    
    public void handleLogout(Context ctx) {
        String sessionId = ctx.cookie("sessionId");
        
        if (sessionId != null) {
            SessionManager.destroySession(sessionId);
        }
        
        // Clear the cookie
        ctx.removeCookie("sessionId");
        
        ctx.status(200).json("{\"success\": true, \"message\": \"Logged out successfully\"}");
        System.out.println("👋 User logged out");
    }
}
