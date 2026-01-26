// ==================== SHARED UTILITY FUNCTIONS ====================
// This file contains common functions used across buyer and seller dashboards

class DashboardUtils {
    
    // ==================== PROFILE MODAL ====================
    static showProfileModal(userData, userType) {
        const profileModal = document.getElementById('profileModal');
        if (!profileModal) return;
        
        // Populate common fields
        document.getElementById('modalUsername').textContent = userData.userName || '-';
        document.getElementById('modalLastName').textContent = userData.lastName || '-';
        document.getElementById('modalEmail').textContent = userData.email || '-';
        document.getElementById('modalPhone').textContent = userData.phoneNo || '-';
        
        // Populate buyer-specific fields
        if (userType === 'buyer') {
            const deliveryLocation = document.getElementById('modalDeliveryLocation');
            if (deliveryLocation) {
                deliveryLocation.textContent = userData.deliveryLocation || '-';
            }
        }
        
        // Populate seller-specific fields
        if (userType === 'seller') {
            const businessName = document.getElementById('modalBusinessName');
            const businessReg = document.getElementById('modalBusinessReg');
            const businessLocation = document.getElementById('modalBusinessLocation');
            
            if (businessName) businessName.textContent = userData.businessName || '-';
            if (businessReg) businessReg.textContent = userData.businessRegNumber || '-';
            if (businessLocation) businessLocation.textContent = userData.businessLocation || '-';
        }
        
        profileModal.classList.add('active');
    }
    
    static hideProfileModal() {
        const profileModal = document.getElementById('profileModal');
        if (profileModal) {
            profileModal.classList.remove('active');
        }
    }
    
    static initializeProfileModal() {
        const closeProfile = document.getElementById('closeProfile');
        const profileModal = document.getElementById('profileModal');
        
        // Close button
        if (closeProfile) {
            closeProfile.addEventListener('click', () => {
                DashboardUtils.hideProfileModal();
            });
        }
        
        // Close when clicking outside
        if (profileModal) {
            profileModal.addEventListener('click', (e) => {
                if (e.target === profileModal) {
                    DashboardUtils.hideProfileModal();
                }
            });
        }
    }
    
    // ==================== LOGOUT FUNCTIONALITY ====================
    static async handleLogout() {
        try {
            const response = await fetch('/api/logout', { 
                method: 'POST' 
            });
            
            // Redirect to login regardless of response
            window.location.href = '/login.html';
        } catch (error) {
            console.error('Logout error:', error);
            // Still redirect on error
            window.location.href = '/login.html';
        }
    }
    
    static initializeLogout() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                DashboardUtils.handleLogout();
            });
        }
    }
    
    // ==================== USER DATA LOADING ====================
    static async loadUserData() {
    try {
        const response = await fetch('/api/user/me', {
            credentials: 'include'  // Important: include cookies
        });
        
        if (response.status === 401) {
            // Not authenticated, redirect to login
            window.location.href = '/login.html';
            return { success: false };
        }
        
        if (response.ok) {
            const responseText = await response.text();
            const data = JSON.parse(responseText);
            
            return {
                success: true,
                user: data.user,
                roles: data.roles
            };
        } else {
            // Other error, redirect to login
            window.location.href = '/login.html';
            return { success: false };
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        window.location.href = '/login.html';
        return { success: false };
    }
}

    // ==================== DISPLAY USER NAME ====================
    static displayUserName(userName, elementId = 'buyerName') {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = userName;
        }
    }
    
    // ==================== HELPER FUNCTIONS ====================
    static formatPrice(price) {
        return `Ksh. ${parseFloat(price).toLocaleString()}`;
    }
    
    static showNotification(message, type = 'info') {
        // Simple alert for now - can be enhanced with custom notifications
        alert(message);
    }
    
    static confirmAction(message) {
        return confirm(message);
    }
}

// ==================== EXPORT FOR USE IN OTHER FILES ====================
// Make DashboardUtils available globally
window.DashboardUtils = DashboardUtils;