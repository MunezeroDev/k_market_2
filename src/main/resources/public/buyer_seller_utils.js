


class DashboardUtils {
    
    
    static showProfileModal(userData, userType) {
        const profileModal = document.getElementById('profileModal');
        if (!profileModal) return;
        
        
        document.getElementById('modalUsername').textContent = userData.userName || '-';
        document.getElementById('modalLastName').textContent = userData.lastName || '-';
        document.getElementById('modalEmail').textContent = userData.email || '-';
        document.getElementById('modalPhone').textContent = userData.phoneNo || '-';
        
        
        if (userType === 'buyer') {
            const deliveryLocation = document.getElementById('modalDeliveryLocation');
            if (deliveryLocation) {
                deliveryLocation.textContent = userData.deliveryLocation || '-';
            }
        }
        
        
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
        
        
        if (closeProfile) {
            closeProfile.addEventListener('click', () => {
                DashboardUtils.hideProfileModal();
            });
        }
        
        
        if (profileModal) {
            profileModal.addEventListener('click', (e) => {
                if (e.target === profileModal) {
                    DashboardUtils.hideProfileModal();
                }
            });
        }
    }
    
    
    static async handleLogout() {
        try {
            const response = await fetch('/api/logout', { 
                method: 'POST' 
            });
            
            
            window.location.href = '/login.html';
        } catch (error) {
            console.error('Logout error:', error);
            
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
    
    
    static async loadUserData() {
    try {
        const response = await fetch('/api/user/me', {
            credentials: 'include'  
        });
        
        if (response.status === 401) {
            
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
            
            window.location.href = '/login.html';
            return { success: false };
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        window.location.href = '/login.html';
        return { success: false };
    }
}

    
    static displayUserName(userName, elementId = 'buyerName') {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = userName;
        }
    }
    
    
    static formatPrice(price) {
        return `Ksh. ${parseFloat(price).toLocaleString()}`;
    }
    
    static showNotification(message, type = 'info') {
        
        alert(message);
    }
    
    static confirmAction(message) {
        return confirm(message);
    }
}



window.DashboardUtils = DashboardUtils;