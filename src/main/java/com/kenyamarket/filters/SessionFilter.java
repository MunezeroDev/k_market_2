package com.kenyamarket.filters;

import com.kenyamarket.utils.SessionManager;
import io.javalin.http.Context;

public class SessionFilter {

	public static void requireAuth(Context ctx) throws Exception {
		String sessionId = ctx.cookie("sessionId");

		if (!SessionManager.isValidSession(sessionId)) {
			System.out.println("🚫 Unauthorized access attempt to: " + ctx.path());
			ctx.status(401).json("{\"success\": false, \"message\": \"Unauthorized. Please login.\"}");
			return;
		}

		System.out.println("✅ Authorized access to: " + ctx.path());
	}

	public static void requireRole(Context ctx, String... requiredRoles) throws Exception {
		String sessionId = ctx.cookie("sessionId");

		SessionManager.SessionData sessionData = SessionManager.getSession(sessionId);

		if (sessionData == null) {
			ctx.status(401).json("{\"success\": false, \"message\": \"Unauthorized. Please login.\"}");
			return;
		}

		boolean hasRole = false;
		for (String requiredRole : requiredRoles) {
			if (sessionData.roles().contains(requiredRole)) {
				hasRole = true;
				break;
			}
		}

		if (!hasRole) {
			ctx.status(403).json("{\"success\": false, \"message\": \"Forbidden. Insufficient permissions.\"}");
			System.out.println("🚫 User " + sessionData.getUser().getUserName() + " denied access to: " + ctx.path());
			return;
		}

		System.out.println("✅ Role-based access granted to: " + ctx.path());
	}
}