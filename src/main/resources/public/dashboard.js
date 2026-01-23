// Check authentication on page load
window.addEventListener('DOMContentLoaded', async () => {
    await checkAuthentication();
});

async function checkAuthentication() {
    try {
        const response = await fetch('/api/user/me', {
            method: 'GET',
            credentials: 'include' // Include cookies
        });
        
        if (response.status === 401) {
            // Not authenticated - redirect to login
            console.log('❌ Not authenticated, redirecting to login...');
            window.location.href = 'login.html';
            return;
        }
        
        if (response.ok) {
            const responseText = await response.text();
            const data = JSON.parse(responseText);
            
            // Parse the user and roles
            const user = data.user;
            const roles = data.roles;
            
            // Load dashboard with user data and roles
            loadDashboard(user, roles);
        } else {
            // Error occurred
            window.location.href = 'login.html';
        }
        
    } catch (error) {
        console.error('Authentication check failed:', error);
        window.location.href = 'login.html';
    }
}

function loadDashboard(user, roles) {
    // Hide loading, show dashboard
    document.getElementById('loadingMsg').style.display = 'none';
    document.getElementById('dashboardContent').style.display = 'block';
    
    // Populate user info
    document.getElementById('userName').textContent = user.userName;
    document.getElementById('userUsername').textContent = user.userName;
    document.getElementById('userEmail').textContent = user.email || 'N/A';
    document.getElementById('userPhone').textContent = user.phoneNo || 'N/A';
    document.getElementById('userRoles').textContent = roles.join(', ') || 'No roles assigned';
    
    // Display role-based sections
    displayRoleSections(roles);
    
    console.log('✅ Dashboard loaded for user:', user.userName, 'with roles:', roles);
}

function displayRoleSections(roles) {
    // Show role sections based on user's roles
    if (roles.includes('buyer')) {
        document.getElementById('buyerSection').classList.add('active');
    }
    
    if (roles.includes('seller')) {
        document.getElementById('sellerSection').classList.add('active');
    }
    
    if (roles.includes('admin')) {
        document.getElementById('adminSection').classList.add('active');
    }
    
    // If no roles, show a message
    if (roles.length === 0) {
        const dashboardContent = document.getElementById('dashboardContent');
        const noRoleMsg = document.createElement('div');
        noRoleMsg.className = 'role-section active';
        noRoleMsg.innerHTML = '<h2>⚠️ No Roles Assigned</h2><p>Please contact an administrator to assign you a role.</p>';
        dashboardContent.appendChild(noRoleMsg);
    }
}

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        const response = await fetch('/api/logout', {
            method: 'POST',
            credentials: 'include'
        });
        
        if (response.ok) {
            console.log('✅ Logged out successfully');
            window.location.href = 'login.html';
        } else {
            console.error('❌ Logout failed');
            // Redirect anyway
            window.location.href = 'login.html';
        }
        
    } catch (error) {
        console.error('Logout error:', error);
        window.location.href = 'login.html';
    }
});