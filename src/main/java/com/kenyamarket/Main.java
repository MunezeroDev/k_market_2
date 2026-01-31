package com.kenyamarket;

import com.kenyamarket.controllers.RegistrationController;
import com.kenyamarket.database.DatabaseConnection;
import com.kenyamarket.controllers.LoginController;
import com.kenyamarket.controllers.ProductController;
import com.kenyamarket.filters.SessionFilter;
import com.kenyamarket.utils.SessionManager;
import io.javalin.Javalin;
import com.google.gson.Gson;
import java.util.HashMap;
import java.util.Map;

public class Main {
	public static void main(String[] args) {

		DatabaseConnection.initializeDatabase();
		DatabaseConnection.testConnection();
		
		LoginController loginController = new LoginController();
		Gson gson = new Gson();

		Javalin app = Javalin.create(config -> {

			config.staticFiles.add("/public");

			config.plugins.enableCors(cors -> {
				cors.add(it -> it.anyHost());
			});

		}).start(7070);

		System.out.println("🚀 KenyaMarket server started on http://localhost:7070");
		System.out.println("🔐 Login page: http://localhost:7070/login.html");

		// PUBLIC Routes (no authentication required)
		app.post("/api/register", RegistrationController::register);
		app.post("/api/login", loginController::handleLogin);
		app.post("/api/logout", loginController::handleLogout);

		app.get("/api/products", ctx -> {
			ProductController.getAllProducts(ctx);
		});

		app.get("/api/products/seller", ctx -> {
			SessionFilter.requireAuth(ctx);
			ProductController.getSellerProducts(ctx);
		});

		app.post("/api/products", ctx -> {
			SessionFilter.requireAuth(ctx);
			ProductController.addProduct(ctx);
		});

		app.put("/api/products/{id}", ctx -> {
			SessionFilter.requireAuth(ctx);
			ProductController.updateProduct(ctx);
		});

		app.delete("/api/products/{id}", ctx -> {
			SessionFilter.requireAuth(ctx);
			ProductController.deleteProduct(ctx);
		});

		app.get("/api/users", ctx -> {
			SessionFilter.requireAuth(ctx);
			RegistrationController.getAllUsers(ctx);
		});

		app.get("/api/session/check", ctx -> {
			String sessionId = ctx.cookie("sessionId");
			SessionManager.SessionData sessionData = SessionManager.getSession(sessionId);

			if (sessionData != null) {
				ctx.json("{\"authenticated\": true, \"user\": \"" + sessionData.getUser().getUserName() + "\"}");
			} else {
				ctx.json("{\"authenticated\": false}");
			}
		});

		app.get("/api/user/me", ctx -> {
			SessionFilter.requireAuth(ctx);

			String sessionId = ctx.cookie("sessionId");
			SessionManager.SessionData sessionData = SessionManager.getSession(sessionId);

			if (sessionData != null) {

				Map<String, Object> response = new HashMap<>();
				response.put("user", sessionData.getUser());
				response.put("roles", sessionData.roles());

				ctx.json(gson.toJson(response));
			}
		});

		app.get("/", ctx -> ctx.redirect("/login.html"));

		Runtime.getRuntime().addShutdownHook(new Thread(() -> {
			DatabaseConnection.closeConnection();
			System.out.println("👋 Server shutdown complete");
		}));
	}
}