package com.kenyamarket.utils;

import com.kenyamarket.models.User;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

public class SessionManager {
    
    
    private static final Map<String, SessionData> sessions = new ConcurrentHashMap<>();
    
    
    private static final long SESSION_TIMEOUT = 30 * 60 * 1000;
    
    
    public static String createSession(User user, List<String> roles) {
        String sessionId = UUID.randomUUID().toString();
        SessionData sessionData = new SessionData(user, roles, System.currentTimeMillis());
        sessions.put(sessionId, sessionData);
        
        System.out.println("✅ Session created for user: " + user.getUserName() + " | SessionID: " + sessionId);
        return sessionId;
    }
    
    
    public static SessionData getSession(String sessionId) {
        if (sessionId == null || sessionId.isEmpty()) {
            return null;
        }
        
        SessionData sessionData = sessions.get(sessionId);
        
        if (sessionData == null) {
            return null;
        }
        
        
        long currentTime = System.currentTimeMillis();
        if (currentTime - sessionData.getCreatedAt() > SESSION_TIMEOUT) {
            sessions.remove(sessionId);
            System.out.println("⏰ Session expired for: " + sessionData.getUser().getUserName());
            return null;
        }
        
        
        sessionData.setCreatedAt(currentTime);
        
        return sessionData;
    }
    
    
    public static boolean isValidSession(String sessionId) {
        return getSession(sessionId) != null;
    }
    
    
    public static void destroySession(String sessionId) {
        SessionData removed = sessions.remove(sessionId);
        if (removed != null) {
            System.out.println("🗑️ Session destroyed for user: " + removed.getUser().getUserName());
        }
    }
    
    
    public static class SessionData {
        private User user;
        private List<String> roles;
        private long createdAt;
        
        public SessionData(User user, List<String> roles, long createdAt) {
            this.user = user;
            this.roles = roles;
            this.createdAt = createdAt;
        }
        
        public User getUser() {
            return user;
        }
        
        public List<String> roles() {
            return roles;
        }
        
        public long getCreatedAt() {
            return createdAt;
        }
        
        public void setCreatedAt(long createdAt) {
            this.createdAt = createdAt;
        }
    }
}